import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import * as styles from './Button.module.scss';

type ButtonVariant = 'submit' | 'link';
type ButtonSize = 'small' | 'medium' | 'large';

type BaseButtonProps = {
  variant: ButtonVariant;
  size?: ButtonSize;
  className?: string | undefined;
  disabled?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

type SubmitButtonProps = BaseButtonProps & {
  variant: 'submit';
  type?: 'submit' | 'button';
  onClick?: () => void;
};

type LinkButtonProps = BaseButtonProps & {
  variant: 'link';
  to?: string;
  onClick?: () => void;
};

type ButtonProps = SubmitButtonProps | LinkButtonProps;

export const Button = (props: ButtonProps) => {
  const {
    variant,
    size = 'medium',
    className,
    disabled = false,
    tooltip,
    icon,
    children,
    ...rest
  } = props;

  const buttonClasses = clsx(
    styles.button,
    variant === 'submit' && styles.submitButton,
    !className && styles[variant],
    !className && styles[size],
    disabled && styles.disabled,
    className
  );

  const renderButton = () => {
    if (variant === 'submit') {
      return (
        <button
          className={buttonClasses}
          type={props.type || 'button'}
          disabled={disabled}
          onClick={props.onClick}
          {...rest}
        >
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </button>
      );
    }

    if (props.to) {
      return (
        <Link
          to={props.to}
          className={buttonClasses}
          onClick={props.onClick}
          {...rest}
        >
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </Link>
      );
    }

    return (
      <button
        className={buttonClasses}
        onClick={props.onClick}
        disabled={disabled}
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
};

