import React from 'react';
import * as styles from './Modal.module.scss'
import { TfiClose } from 'react-icons/tfi';

type Props = {
  onClose: () => void,
  children: React.ReactNode
}

export const Modal = (props: Props) => {
  const { onClose, children } = props;

  /* 
    VERY IMPORTANT! Otherwise clicks on this modal bubble up to an unknown number of parents. 
    If this is removed, bad stuff will happen when modals are clicked...
  */
    const handleBackgroundClick = (e) => {
      e.stopPropagation(); // This prevents the click from reaching the parent component and triggering its own click event.
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

  return (
    <div className={styles.modalBackground} onClick={handleBackgroundClick}>
      <div className={styles.modalBox}>
        <TfiClose className={styles.closeModal} onClick={() => onClose()}/>
        {children}
      </div>
    </div>
  )
}