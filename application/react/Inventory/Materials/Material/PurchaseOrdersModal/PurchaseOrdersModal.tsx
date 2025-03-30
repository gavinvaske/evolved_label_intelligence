import { IMaterial, IMaterialOrder } from "@shared/types/models";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMaterialOrdersByIds } from "../../../../_queries/materialOrder";
import { LoadingIndicator } from "../../../../_global/LoadingIndicator/LoadingIndicator";
import { useErrorMessage } from "../../../../_hooks/useErrorMessage";
import { getDayMonthYear } from "../../../../_helperFunctions/dateTime";
import { MdOutlinePreview } from "react-icons/md";
import { IoCreateOutline } from "react-icons/io5";
import { Modal } from "../../../../_global/Modal/Modal";
import clsx from "clsx";
import * as materialCardStyles from '../MaterialCard.module.scss'

type ModalProps = {
  material: IMaterial,
  onClose: () => void
}

export const PurchaseOrderModal = (props: ModalProps) => {
  const { material, onClose } = props;
  const navigate = useNavigate();

  return (
    <Modal onClose={() => onClose()}>
      <div className={clsx(materialCardStyles.modalContent)}>
        <div className={clsx(materialCardStyles.titleWrapper)}>
          <h4>Purchase orders: {material.materialId}</h4>
          <i>
            <IoCreateOutline
              title='Create New Material Order'
              size={20}
              onClick={() => navigate('/react-ui/forms/material-order', {
                state: {
                  material: material._id
                }
              })}
            />
          </i>
          <i>
            <MdOutlinePreview
              title='View All Material Orders'
              size={20}
              onClick={() => navigate('/react-ui/tables/material-order')}
            />
          </i>
        </div>
        <div className={materialCardStyles.purchaseOrderInfoWrapper}>
          <div className={materialCardStyles.poTable}>
            <div className={materialCardStyles.tbHeader}>
              <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cellOne)}>
                <div className={materialCardStyles.pulseIndicator}></div>
                PO #
              </div>
              <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cellTwo)}>
                Order Date
              </div>
              <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cellThree)}>
                Arrival Date
              </div>
              <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cellFour)}>
                Total Feet
              </div>
            </div>
            {renderPurchaseOrders(material)}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function renderPurchaseOrders(material: IMaterial) {
  const navigate = useNavigate();
  const { isPending, isFetching, data: materialOrders, isError, error } = useQuery<IMaterialOrder[]>({
    queryKey: ['get-material-orders', JSON.stringify(material.inventory.materialOrders)],
    queryFn: async () => {
      const materials = await getMaterialOrdersByIds(material.inventory.materialOrders);

      return materials
    },
    initialData: []
  })

  if (isPending || isFetching) return (<LoadingIndicator />)

  if (isError) {
    useErrorMessage(error)
  }

  materialOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  return (
    materialOrders.map((mo, index: number) => (
      <div className={materialCardStyles.tbRow} key={index} onClick={() => navigate(`/react-ui/forms/material-order/${mo._id}`)}>
        <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cellOne)}>
          <div className={materialCardStyles.pulseIndicator}></div>
          {mo.purchaseOrderNumber}
        </div>
        <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cellTwo)}>
          <div className={materialCardStyles.pulseIndicator}></div>
          {getDayMonthYear(mo.orderDate)}
        </div>
        <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cellThree)}>
          <div className={materialCardStyles.pulseIndicator}></div>
          {getDayMonthYear(mo.arrivalDate)}
        </div>
        <div className={clsx(materialCardStyles.tbCell, materialCardStyles.cellFour)}>
          <div className={materialCardStyles.pulseIndicator}></div>
          {(mo.feetPerRoll * mo.totalRolls)}
        </div>
      </div>
    ))
  )
}