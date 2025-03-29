import { useNavigate } from "react-router-dom";
import { Modal } from "../../../../_global/Modal/Modal";
import { IMaterial, IMaterialLengthAdjustment } from "@shared/types/models";
import { IoCreateOutline } from "react-icons/io5";
import { MdOutlinePreview } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { getMaterialLengthAdjustmentsByIds } from "../../../../_queries/materialLengthAdjustment";
import { MongooseIdStr } from "@shared/types/typeAliases";
import { LoadingIndicator } from "../../../../_global/LoadingIndicator/LoadingIndicator";
import { useErrorMessage } from "../../../../_hooks/useErrorMessage";
import { getDateTimeFromIsoStr } from "@ui/utils/dateTime";
import './LengthAdjustmentsModal.scss';
import * as materialCardStyles from '../MaterialCard.module.scss'
import clsx from "clsx";

type ModalProps = {
  material: IMaterial,
  onClose: () => void
}

export const LengthAdjustmentsModal = (props: ModalProps) => {
  const { material, onClose } = props;
  const navigate = useNavigate();

  return (
    <Modal onClose={() => onClose()}>
      <div className={materialCardStyles.modalContent}>
        <div className={materialCardStyles.titleWrapper}>
          <h4>Material Length Adjustments: {material.materialId}</h4>
          <i>
            <IoCreateOutline
              title='Create New Length Adjustment'
              size={20}
              onClick={() => navigate('/react-ui/forms/material-length-adjustment', {
                state: {
                  material: material._id
                }
              })}
            />
          </i>
          <i>
            <MdOutlinePreview
              title='View All Length Adjustments'
              size={20}
              onClick={() => navigate('/react-ui/tables/material-length-adjustment')}
            />
          </i>
        </div>
        <div className={materialCardStyles.purchaseOrderInfoWrapper}>
          <div className={materialCardStyles.poTable}> 
            <div className={materialCardStyles.tbHeader}>
              <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cell33)}>
                <div className={materialCardStyles.pulseIndicator}></div>
                Material Name
              </div>
              <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cell33)}>
                Length
              </div>
              <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cell33)}>
                Updated At
              </div>
            </div>
            {renderMaterialLengthAdjustments(material)}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function renderMaterialLengthAdjustments(material: IMaterial) {
  const navigate = useNavigate();
  const { isPending, isFetching, data: lengthAdjustments, isError, error } = useQuery<IMaterialLengthAdjustment[]>({
    queryKey: ['material-length-adjustments', JSON.stringify(material.inventory.lengthAdjustments)],
    queryFn: async () => {
      const lengthAdjustments = await getMaterialLengthAdjustmentsByIds(material.inventory.lengthAdjustments as MongooseIdStr[]);

      return lengthAdjustments
    },
    initialData: []
  })

  if (isPending || isFetching) return (<LoadingIndicator />)

  if (isError) {
    useErrorMessage(error)
  }

  lengthAdjustments.sort((a, b) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime());

  return (
    lengthAdjustments.map((lo, index: number) => (
      <div className={materialCardStyles.tbRow} key={index} onClick={() => navigate(`/react-ui/forms/material-length-adjustment/${lo._id}`)}>
        <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cell33)}>
          <div className={materialCardStyles.pulseIndicator}></div>
          {(lo.material as IMaterial).name}
        </div>
        <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cell33)}>
          {lo.length}
        </div>
        <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cell33)}>
          {getDateTimeFromIsoStr(lo.updatedAt)}
        </div>
      </div>
    ))
  )
}