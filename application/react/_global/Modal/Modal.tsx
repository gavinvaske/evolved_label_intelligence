import React from 'react';
import * as styles from './Modal.module.scss'
import { TfiClose } from 'react-icons/tfi';

type ModalSize = 'standard' | 'fullscreen';

type Props = {
  onClose: () => void,
  children: React.ReactNode,
  size?: ModalSize
}

export const Modal = (props: Props) => {
  const { onClose, children, size = 'standard' } = props;

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const backgroundClass = size === 'fullscreen' 
    ? styles.fullscreenModalBackground 
    : styles.modalBackground;

  return (
    <div className={backgroundClass} onClick={handleBackgroundClick}>
      <div className={styles.modalBox}>
        <TfiClose className={styles.closeModal} onClick={() => onClose()}/>
        {children}
      </div>
    </div>
  )
}