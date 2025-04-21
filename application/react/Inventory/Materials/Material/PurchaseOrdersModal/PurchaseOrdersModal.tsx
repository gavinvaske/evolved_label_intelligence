import { TableModal } from '../../../../_global/TableModal/TableModal';
import { IMaterial } from '@shared/types/models';
import { ReactNode } from 'react';
import * as styles from './PurchaseOrdersModal.module.scss';
import { useQuery } from '@tanstack/react-query';
import { getMaterialOrdersByIds } from '../../../../_queries/materialOrder';
import { MongooseIdStr } from '@shared/types/typeAliases';
import { LoadingIndicator } from '../../../../_global/LoadingIndicator/LoadingIndicator';
import { getDateTimeFromIsoStr } from '@ui/utils/dateTime';

type Props = {
  material: IMaterial;
};

export const PurchaseOrdersModal = ({ material}: Props) => {
  const columns = [
    { label: 'PO #', hasPulseIndicator: true },
    { label: 'Order Date' },
    { label: 'Arrival Date' },
    { label: 'Total Feet' }
  ];

  return (
    <div className={styles.modalContent}>
      <TableModal
        title={`Purchase orders: ${material.materialId}`}
        createPath="/react-ui/forms/material-order"
        createState={{ material: material._id }}
        viewAllPath="/react-ui/tables/material-order"
        columns={columns}
      >
        <div className={styles.tableWrapper}>
          {renderPurchaseOrders(material)}
        </div>
      </TableModal>
    </div>
  );
};

function renderPurchaseOrders(material: IMaterial): ReactNode {
  const { isPending, data: materialOrders } = useQuery({
    queryKey: ['material-orders', JSON.stringify(material.inventory.materialOrders)],
    queryFn: () => getMaterialOrdersByIds(material.inventory.materialOrders as MongooseIdStr[])
  });

  if (isPending) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      {materialOrders?.map((order) => (
        <div key={order._id} className={styles.row}>
          <div>{order.poNumber}</div>
          <div>{getDateTimeFromIsoStr(order.orderDate)}</div>
          <div>{getDateTimeFromIsoStr(order.arrivalDate)}</div>
          <div>{order.totalFeet}</div>
        </div>
      ))}
    </div>
  );
}