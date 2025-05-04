import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import * as styles from './Button.module.scss';

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonColor = 'white' | 'blue' | 'purple' | 'red';

type ButtonProps = {
  size?: ButtonSize;
  color?: ButtonColor;
  className?: string;
  disabled?: boolean;
  enabled?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  to?: string;
  type?: 'submit' | 'button';
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>((props, ref) => {
  const {
    size = 'medium',
    color,
    className,
    disabled = false,
    enabled = false,
    tooltip,
    icon,
    children,
    onClick,
    to,
    type = 'submit',
    ...rest
  } = props;

  const buttonClasses = clsx(
    styles.button,
    color && styles[color],
    styles[size],
    disabled && styles.disabled,
    enabled && styles.enabled,
    className
  );

  const renderButton = () => {
    if (to) {
      return (
        <Link
          ref={ref as React.RefObject<HTMLAnchorElement>}
          to={to}
          className={buttonClasses}
          onClick={onClick}
          {...rest}
        >
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        className={buttonClasses}
        onClick={onClick}
        disabled={disabled}
        type={type}
        {...rest}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </button>
    );
  };

  if (tooltip) {
    return (
      <div className={clsx(styles.tooltipWrapper)}>
        {renderButton()}
        <span className={styles.tooltipText}>{tooltip}</span>
      </div>
    );
  }

  return renderButton();
});

