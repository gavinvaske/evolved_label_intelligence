import React from 'react';
import './Modal.scss';

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
    <div className='modal-background' onClick={handleBackgroundClick}>
      <div className='modal-box'>
        <i className='fa-light fa-xmark close-modal' onClick={() => onClose()}></i>
        {children}
      </div>
    </div>
  )
}