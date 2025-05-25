import { Modal } from './Modal';
import * as styles from './ConfirmationModal.module.scss';
import { Button } from '../Button/Button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | JSX.Element;
  confirmText: string;
  cancelText: string;
};

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }: Props) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className={styles.confirmationContent}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <Button color="white" onClick={onClose}>
            {cancelText}
          </Button>
          <Button color="red" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 