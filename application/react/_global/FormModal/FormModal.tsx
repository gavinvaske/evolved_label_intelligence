import clsx from 'clsx';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as styles from './FormModal.module.scss';
import { TfiClose } from "react-icons/tfi";

export const FormModal = (props) => {
  const {
    Form,
    onCancel,
    onSubmit,
    ...additionalProps
  } = props;

  return (
    <div className={styles.modalWrapper}>
      <div className={clsx(styles.modal, sharedStyles.card)}>
        <button className={styles.closeButton} type="button" onClick={() => onCancel()}><TfiClose /></button>
        <div className={styles.modalContent}>
          <Form
            onSubmit={onSubmit}
            onCancel={onCancel}
            {...additionalProps}
          />
        </div>
      </div>
    </div>
  )
}
