import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import * as styles from './IconButton.module.scss';

type IconButtonProps = {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  to?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  tooltip?: string;
  disabled?: boolean;
  variant?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'lightBlue' | 'yellow' | 'magenta' | 'darkGrey';
};

export const IconButton = ({
  icon,
  onClick,
  to,
  size = 'medium',
  className,
  tooltip,
  disabled = false,
  variant
}: IconButtonProps) => {
  const buttonClasses = clsx(
    styles.iconButton,
    styles[size],
    styles.default,
    disabled && styles['disabled'],
    variant && styles[variant],
    className
  );

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.stopPropagation();
      return;
    };
    onClick?.(e);
  };

  const iconElement = (
    <div className={buttonClasses} onClick={handleClick}>
      {icon}
    </div>
  );

  if (tooltip) {
    return (
      <div className={clsx(styles.tooltipWrapper)}>
        {to ? (
          <Link to={to} onClick={handleClick}>
            {iconElement}
          </Link>
        ) : (
          iconElement
        )}
        <span className={styles.tooltipText}>{tooltip}</span>
      </div>
    );
  }

  if (to) {
    return (
      <Link to={to} onClick={handleClick}>
        {iconElement}
      </Link>
    );
  }

  return iconElement;
}; 