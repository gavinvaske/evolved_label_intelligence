import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import * as styles from './Dropdown.module.scss';

type DropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string | undefined;
  align?: 'left' | 'right';
  triggerRef?: React.RefObject<HTMLElement>;
};

export const Dropdown = ({ isOpen, onClose, children, className, align = 'left', triggerRef, ...rest }: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking the trigger button
      if (triggerRef?.current?.contains(event.target as Node)) {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={clsx(
        styles.dropdown,
        align === 'right' && styles.alignRight,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};