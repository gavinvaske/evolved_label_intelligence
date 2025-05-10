import React from 'react';
import clsx from 'clsx';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as styles from './FormModal.module.scss';
import { TfiClose } from "react-icons/tfi";

interface FormModalProps {
  Form: React.ComponentType<any>;
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  title?: string;
  initialData?: any;
  [key: string]: any;
}

export const FormModal = (props: FormModalProps) => {
  const {
    Form,
    isOpen,
    onCancel,
    onSubmit,
    title,
    initialData,
    ...rest
  } = props;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleSubmit = (data: any) => {
    onSubmit(data);
    onCancel(); // Close modal after successful submit
  };

  if (!isOpen) return null;

  return (
    <div 
      className={clsx(styles.modalWrapper, isOpen && styles.open)} 
      onClick={handleBackdropClick}
    >
      <div className={clsx(styles.modal, sharedStyles.card)}>
        <div className={styles.modalHeader}>
          {title && <h3>{title}</h3>}
          <button 
            className={styles.closeButton} 
            type="button" 
            onClick={onCancel}
            aria-label="Close modal"
          >
            <TfiClose />
          </button>
        </div>
        <div className={styles.modalContent}>
          <Form
            onSubmit={handleSubmit}
            onCancel={onCancel}
            initialData={initialData}
            {...rest}
          />
        </div>
      </div>
    </div>
  );
};
