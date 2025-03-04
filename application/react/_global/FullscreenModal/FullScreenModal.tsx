import React from 'react';
import './FullscreenModal.scss';

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
    <div className='modal fullscreen-modal-background' onClick={(e) => closeModalIfBackgroundWasClicked(e) }>
      <div className='modal-box'>
        <i className='fa-light fa-xmark close-modal' onClick={() => onClose()}></i>
        {children}
      </div>
    </div>
  )
}