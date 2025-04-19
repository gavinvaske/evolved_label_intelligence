import React, { forwardRef } from 'react';
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { BsCurrencyDollar } from "react-icons/bs";
import * as formStyles from '@ui/styles/form.module.scss'
import clsx from 'clsx';
import * as styles from './Input.module.scss';
import textStyles from '@ui/styles/typography.module.scss';

type Props<T extends FieldValues> = {
  attribute: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors;
  placeholder?: string;
  isRequired?: boolean;
  additionalRegisterOptions?: any;
  onChange?: () => void;
  fieldType?: 'text' | 'checkbox' | 'date' | 'password' | 'currency' | 'percent';
  ref?: any;
  dataAttributes?: { [key: `data-${string}`]: string };
  leftUnit?: string; // New: Represents unit on the left (e.g., 'kg')
  rightUnit?: string; // Renamed: Represents unit on the right (e.g., 'mm')
  RightIcon?: React.ReactNode; // Mutually exclusive with `rightUnit`
  LeftIcon?: React.ReactNode; // Mutually exclusive with `leftUnit`
};

interface WithForwardRefType extends React.FC<Props<FieldValues>> {
  <T extends FieldValues>(props: Props<T>): ReturnType<React.FC<Props<T>>>;
}

export const Input: WithForwardRefType = forwardRef((props, customRef) => {
  const { placeholder, errors, attribute, label, register, isRequired, fieldType, dataAttributes, leftUnit, rightUnit, RightIcon, LeftIcon } = props;

  const { ref, ...rest } = register(attribute, {
    required: isRequired ? 'This is required' : undefined,
  });

  return (
    <div className={clsx(formStyles.inputWrapper, styles.inputWrapper)}>
      <label>
        {label}<span className={clsx(textStyles.textRed, styles.requiredIndicator)}>{isRequired ? '*' : ''}</span>:
      </label>
      <div className={styles.inputFieldContainer}>

        {/* Left Unit / Icon */}
        {(LeftIcon || leftUnit || fieldType === 'currency') && (
          <div className={styles.leftContainer}>
            {/* Set default icon on currency fields IFF no override was provided */}
            {(!LeftIcon && !leftUnit) && fieldType === 'currency' && (<span><BsCurrencyDollar /></span>)}
            
            {LeftIcon && <span>{LeftIcon}</span>}
            {leftUnit && <span>{leftUnit}</span>}
          </div>
        )}

        {/* Input Field */}
        <input
          {...rest}
          type={fieldType || 'text'}
          placeholder={placeholder}
          ref={(e) => {
            ref(e);
            if (customRef) {
              customRef.current = e;
            }
          }}
          {...dataAttributes}
        />

        {/* Right Unit / Icon */}
        {(RightIcon || rightUnit) && (
          <div className={styles.rightContainer}>
            {RightIcon && <span>{RightIcon}</span>}
            {rightUnit && <span>{rightUnit}</span>}
          </div>
        )}
      </div>
      <FormErrorMessage errors={errors} name={attribute} />
    </div>
  );
});