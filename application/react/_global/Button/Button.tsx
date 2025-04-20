import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import * as styles from './Button.module.scss';

type ButtonVariant = 'submit' | 'link' | 'action';
type ButtonSize = 'small' | 'medium' | 'large';
type ButtonStyle = 'default' | 'white';

type BaseButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: ButtonStyle;
  className?: string | undefined;
  disabled?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

type SubmitButtonProps = BaseButtonProps & {
  variant: 'submit';
  type?: 'submit' | 'button';
  onClick?: React.MouseEventHandler<HTMLElement>;
};

type LinkButtonProps = BaseButtonProps & {
  variant: 'link';
  to?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

type ActionButtonProps = BaseButtonProps & {
  variant?: 'action';
  onClick: React.MouseEventHandler<HTMLElement>;
};

type ButtonProps = SubmitButtonProps | LinkButtonProps | ActionButtonProps;

export const Button = (props: ButtonProps) => {
  const {
    variant,
    size = 'medium',
    style = 'default',
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
    style === 'white' && styles.white,
    !className && variant && styles[variant],
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

    if (variant === 'link' && props.to) {
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

