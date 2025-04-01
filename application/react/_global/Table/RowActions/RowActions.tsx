import React from 'react'
import { RxDotsVertical } from "react-icons/rx";
import * as styles from './RowActions.module.scss';
import clsx from 'clsx';

export const RowActions = (props) => {
  const [isOpened, setIsOpened] = React.useState(false);
  const { children }: { children: React.ReactNode } = props;

  const toggleRowActions = () => setIsOpened(!isOpened)

  return (
    <div className={styles.rowActions}>
      <div className={clsx(styles.dropdownBtn, isOpened ? styles.active : '')} onClick={toggleRowActions}>
        <RxDotsVertical />
        <div className={clsx(styles.dropdownOptions, isOpened ? styles.show : '')}>
          {children}
        </div>
      </div>
    </div>
  )
}

interface RowActionItem extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: any;
  text: string;
}

export const RowActionItem = ({ Icon, text, ...rest }: RowActionItem) => {
  return (
    <div className={styles.dropdownOption} {...rest}>
      {Icon && <Icon />}
      {text}
    </div>
  )
}