import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import * as styles from './IconButton.module.scss';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  to?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  tooltip?: string;
  disabled?: boolean;
  color: 'blue' | 'red' | 'purple' | 'orange' | 'lightBlue' | 'yellow' | 'magenta' | 'darkGrey' | 'green';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  to,
  size = 'medium',
  className,
  tooltip,
  disabled = false,
  color,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  const buttonContent = (
    <div
      className={clsx(
        styles.iconButton,
        styles[size],
        styles[color],
        disabled && styles.disabled,
        className
      )}
      onClick={handleClick}
    >
      {icon}
    </div>
  );

  const content = (
    <div className={styles.tooltipWrapper}>
      {to && !disabled ? (
        <Link to={to} onClick={handleClick}>
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}
      {tooltip && <span className={styles.tooltipText}>{tooltip}</span>}
    </div>
  );

  return content;
}; 