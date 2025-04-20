import React, { forwardRef, useState, useEffect } from 'react';
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage';
import { FieldValues, Path, RegisterOptions, useFormContext } from 'react-hook-form';
import { BsCurrencyDollar } from "react-icons/bs";
import * as formStyles from '@ui/styles/form.module.scss'
import clsx from 'clsx';
import * as styles from './Input.module.scss';
import * as textStyles from '@ui/styles/typography.module.scss';

type Props<T extends FieldValues> = {
  attribute: Path<T>;
  label: string;
  placeholder?: string;
  isRequired?: boolean;
  onChange?: () => void;
  fieldType?: 'text' | 'checkbox' | 'date' | 'password' | 'currency' | 'percent';
  ref?: any;
  dataAttributes?: { [key: `data-${string}`]: string };
  leftUnit?: string; // New: Represents unit on the left (e.g., 'kg')
  rightUnit?: string; // Renamed: Represents unit on the right (e.g., 'mm')
  RightIcon?: React.ReactNode; // Mutually exclusive with `rightUnit`
  LeftIcon?: React.ReactNode; // Mutually exclusive with `leftUnit`
  defaultChecked?: boolean;
};

interface WithForwardRefType extends React.FC<Props<FieldValues>> {
  <T extends FieldValues>(props: Props<T>): ReturnType<React.FC<Props<T>>>;
}

export const Input: WithForwardRefType = forwardRef((props, customRef) => {
  const { placeholder, attribute, label,  isRequired, fieldType, dataAttributes, leftUnit, rightUnit, RightIcon, LeftIcon, defaultChecked } = props;
  const [value, setValue] = useState('');
  const formContext = useFormContext();
  const {getValues, register, formState: { errors }} = formContext;

  const registerOptions: RegisterOptions = {
    required: isRequired ? 'This is required' : false,
  };
  const { ref, ...rest } = register(attribute, registerOptions);

  useEffect(() => {
    // Check if the field has a value from react-hook-form
    const formValue = getValues(attribute);
  
    if (formValue) {
      setValue(formValue);
    }
  }, [formContext, attribute]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (rest.onChange) {
      rest.onChange(e);
    }
  };

  const requiredFieldIsEmpty = isRequired && (!value);

  return (
    <div className={clsx(formStyles.inputWrapper, styles.inputWrapper)}>
      <label>
        {label}<span className={clsx(textStyles.textRed, styles.requiredIndicator)}>{isRequired ? '*' : ''}</span>
      </label>
      {fieldType === 'checkbox' ? (
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            defaultChecked={defaultChecked}
            {...rest}
            ref={(e) => {
              ref(e);
              if (customRef && 'current' in customRef) {
                customRef.current = e;
              }
            }}
            {...dataAttributes}
          />
        </div>
      ) : (
        <div className={clsx(styles.inputFieldContainer, requiredFieldIsEmpty && styles.error)}>
          {/* Left Unit / Icon */}
          {(LeftIcon || leftUnit || fieldType === 'currency') && (
            <div className={styles.leftContainer}>
              {(!LeftIcon && !leftUnit) && fieldType === 'currency' && (<span><BsCurrencyDollar /></span>)}
              {LeftIcon && <span>{LeftIcon}</span>}
              {leftUnit && <span>{leftUnit}</span>}
            </div>
          )}

          {/* Input Field */}
          <input
            {...rest}
            onChange={handleChange}
            type={fieldType || 'text'}
            placeholder={placeholder}
            ref={(e) => {
              ref(e);
              if (customRef && 'current' in customRef) {
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
      )}
      <FormErrorMessage errors={errors} name={attribute} />
    </div>
  );
});