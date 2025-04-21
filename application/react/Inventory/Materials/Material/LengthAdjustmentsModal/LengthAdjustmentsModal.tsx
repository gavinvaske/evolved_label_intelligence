import { useNavigate } from "react-router-dom";
import { TableModal } from "../../../../_global/TableModal/TableModal";
import { IMaterial, IMaterialLengthAdjustment } from "@shared/types/models";
import { useQuery } from "@tanstack/react-query";
import { getMaterialLengthAdjustmentsByIds } from "../../../../_queries/materialLengthAdjustment";
import { MongooseIdStr } from "@shared/types/typeAliases";
import { LoadingIndicator } from "../../../../_global/LoadingIndicator/LoadingIndicator";
import { getDateTimeFromIsoStr } from "@ui/utils/dateTime";
import { ReactNode } from "react";
import * as styles from './LengthAdjustmentsModal.module.scss';

type Props = {
  material: IMaterial;
};

export const LengthAdjustmentsModal = ({ material }: Props) => {
  const columns = [
    { label: 'Date' },
    { label: 'Length' },
    { label: 'Notes' }
  ];

  return (
    <div className={styles.modalContent}>
      <TableModal
        title={`Length adjustments: ${material.materialId}`}
        createPath="/react-ui/forms/material-length-adjustment"
        createState={{ material: material._id }}
        viewAllPath="/react-ui/tables/material-length-adjustment"
        columns={columns}
      >
        <div className={styles.tableWrapper}>
          {renderLengthAdjustments(material)}
        </div>
      </TableModal>
    </div>
  );
};

function renderLengthAdjustments(material: IMaterial): ReactNode {
  const { isPending, data: lengthAdjustments } = useQuery<IMaterialLengthAdjustment[]>({
    queryKey: ['material-length-adjustments', JSON.stringify(material.inventory.lengthAdjustments)],
    queryFn: () => getMaterialLengthAdjustmentsByIds(material.inventory.lengthAdjustments as MongooseIdStr[])
  });

  if (isPending) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      {lengthAdjustments?.map((adjustment, index) => (
        <div key={index} className={styles.row}>
          <div>{getDateTimeFromIsoStr(adjustment.createdAt)}</div>
          <div>{adjustment.length}</div>
          <div>{adjustment.notes}</div>
        </div>
      ))}
    </div>
  );
}