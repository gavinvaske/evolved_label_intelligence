import { IContactForm } from '@ui/types/forms';
import * as styles from './ContactCard.module.scss'
import { IoTrashOutline } from 'react-icons/io5';

type Props = {
  data: IContactForm,
  onDelete: () => void
}

const ContactCard = (props: Props) => {
  const { data, onDelete } = props;
  const {
    fullName, phoneNumber, phoneExtension, email,
    contactStatus, notes, position, location
  } = data;

  return (
    <div className={styles.contactCard}>
      <div className={styles.columnTd}>{fullName}</div>
      <div className={styles.columnTd}>{phoneNumber}</div>
      <div className={styles.columnTd}>{phoneExtension}</div>
      <div className={styles.columnTd}>{email}</div>
      <div className={styles.columnTd}>{contactStatus}</div>
      <div className={styles.columnTd}>{notes}</div>
      <div className={styles.columnTd}>{position}</div>
      <div className={styles.columnTd}>{location?.name}</div>
      <div className={styles.columnTd}>
        <i><IoTrashOutline className={styles.deleteIcon} onClick={onDelete} /></i>
      </div>

    </div>
  )
}

export default ContactCard;