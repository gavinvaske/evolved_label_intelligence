import { IShippingLocationForm } from '@ui/types/forms';
import * as styles from './ShippingLocationCard.module.scss'
import { IoTrashOutline } from 'react-icons/io5';
import clsx from 'clsx';

type Props = {
  data: IShippingLocationForm,
  onDelete: () => void
}

const ShippingLocationCard = (props: Props) => {
  const { data, onDelete } = props;
  const { freightAccountNumber, deliveryMethod, name, street, unitOrSuite, city, state, zipCode } = data;

  return (
    <div className={styles.shippingLocationCard}>
      <div className={styles.columnTd}>{freightAccountNumber}</div>
      <div className={styles.columnTd}>{deliveryMethod}</div>
      <div className={styles.columnTd}>{name}</div>
      <div className={styles.columnTd}>{street}</div>
      <div className={styles.columnTd}>{unitOrSuite}</div>
      <div className={styles.columnTd}>{city}</div>
      <div className={styles.columnTd}>{state}</div>
      <div className={styles.columnTd}>{zipCode}</div>
      <div className={clsx(styles.columnTd, styles.deleteIcon)} onClick={onDelete}><IoTrashOutline /></div>
    </div>
  )
}

export default ShippingLocationCard;
