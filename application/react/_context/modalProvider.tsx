import React, { createContext, useState, useContext, ElementType, ReactNode } from 'react';

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export type RequiredModalProps<T = any> = ElementType<{ onClose: () => void } & T>;

type ModalContextType = {
  openModal: <T>(Component: RequiredModalProps<T>, props?: T) => void;
  closeModal: () => void;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [Modal, setModal] = useState<RequiredModalProps | null>(null);
  const [modalProps, setModalProps] = useState<any>({});

  const openModal = <T,>(Component: RequiredModalProps<T>, props?: T) => {
    setModal(() => Component); // Store the component type
    setModalProps(props || {}); // Store the props
  };
  const closeModal = () => {
    setModal(null);
    setModalProps({});
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {Modal && <Modal onClose={closeModal} {...modalProps}/>}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};