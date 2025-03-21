import { IAddressForm } from '@ui/types/forms';
import { IoTrashOutline } from "react-icons/io5";
import * as styles from './AddressListItem.module.scss';

interface Props {
  onDelete: () => void;
  data: IAddressForm
}
const AddressListItem = (props: Props) => {
  const { data, onDelete } = props;
  const { name, street, unitOrSuite, city, state, zipCode } = data;
  return (
    <div className={styles.addressCard}>
        <div className={styles.columnTd}>{name}</div>
        <div className={styles.columnTd}>{street}</div>
        <div className={styles.columnTd}>{unitOrSuite}</div>
        <div className={styles.columnTd}>{city}</div>
        <div className={styles.columnTd}>{state}</div>
        <div className={styles.columnTd}>{zipCode}</div>

        <div className={styles.columnTd}>
          <i><IoTrashOutline className='delete-icon' onClick={onDelete}/></i>
        </div>
    </div>
  )
}

export default AddressListItem;
