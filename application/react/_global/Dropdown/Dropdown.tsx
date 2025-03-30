import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { useDropdownContext } from '../../_context/dropdownProvider';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  isActive?: boolean;
  className?: string;
  onClose?: () => void
};

export const Dropdown = (props: PropsWithChildren<Props>) => {
  const { isActive, className, children, onClose } = props;
  const context = useDropdownContext();
  const [isOpen, setIsOpen] = React.useState(isActive || false);

  if (!context) {
    throw new Error('useDropdownContext() must be used within a DropdownProvider');
  }

  const { registerDropdown, unregisterDropdown } = context;
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(isActive || false);
  }, [isActive]);

  useEffect(() => {
    if (!elementRef.current) return;

    const uuid = uuidv4();

    registerDropdown(uuid, elementRef);

    return () => {
      unregisterDropdown(uuid);
    }
  }, []);

  useEffect(() => {
    if (elementRef.current) {
      const closeMethod = {
        close: () => {
          if (isOpen && elementRef.current) {
            setIsOpen(false);
            onClose && onClose();
          }
        }
      };
      // Add custom close() to ref.current
      Object.assign(elementRef.current, closeMethod);
    }
  }, [isOpen, onClose]);

  return (
    <div className={`dropdown-menu ${className} ${isOpen ? 'active' : ''}`} ref={elementRef}>
      {children}
    </div>
  );
};