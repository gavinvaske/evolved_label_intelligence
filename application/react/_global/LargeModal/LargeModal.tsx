import React from 'react';
import * as styles from './LargeModal.module.scss';
import { TfiClose } from 'react-icons/tfi';

type Props = {
  onClose: () => void,
  children: React.ReactNode
}

export const FullScreenModal = (props: Props) => {
  const { onClose, children } = props;

  const closeModalIfBackgroundWasClicked = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className={styles.fullscreenModalBackground} onClick={(e) => closeModalIfBackgroundWasClicked(e) }>
      <div className={styles.modalBox}>
        <TfiClose className={styles.closeModal} onClick={() => onClose()}/>
        {children}
      </div>
    </div>
  )
}