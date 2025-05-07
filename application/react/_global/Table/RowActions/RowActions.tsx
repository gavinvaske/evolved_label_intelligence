import React from 'react'
import { RxDotsVertical } from "react-icons/rx";
import * as styles from './RowActions.module.scss';
import clsx from 'clsx';

interface RowActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const RowActions: React.FC<RowActionsProps> = ({ children }) => {
  const [isOpened, setIsOpened] = React.useState(false);

  const toggleRowActions = () => setIsOpened(!isOpened)

  return (
    <div className={styles.rowActions}  data-test="row-actions">
      <div 
        className={clsx(styles.dropdownBtn, isOpened ? styles.active : '')} 
        onClick={toggleRowActions}
        data-test="row-actions-button"
      >
        <RxDotsVertical />
      </div>
      {isOpened && (
        <div className={clsx(styles.dropdownOptions, styles.show)} data-test="row-actions-menu">
          {children}
        </div>
      )}
    </div>
  )
}

interface RowActionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: any;
  text: string;
  onClick: () => void;
}

export const RowActionItem: React.FC<RowActionItemProps> = ({ Icon, text, onClick }) => {
  return (
    <div 
      className={styles.dropdownOption} 
      onClick={onClick}
      data-test="row-action-item"
    >
      {Icon && <Icon />}
      <span>{text}</span>
    </div>
  )
}