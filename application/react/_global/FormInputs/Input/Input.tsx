import React, { forwardRef } from 'react';
import './Input.scss'
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { BsCurrencyDollar } from "react-icons/bs";

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
    <div className="input-wrapper">
      <label>
        {label} <span className="red">{isRequired ? '*' : ''}</span>:
      </label>
      <div className="input-field-container">

        {/* Left Unit / Icon */}
        {(LeftIcon || leftUnit || fieldType === 'currency') && (
          <div className="left-container">
            {/* Set default icon on currency fields IFF no override was provided */}
            {(!LeftIcon && !leftUnit) && fieldType === 'currency' && (<span className="left-input-field-icon"><BsCurrencyDollar /></span>)}
            
            {LeftIcon && <span className="left-input-field-icon">{LeftIcon}</span>}
            {leftUnit && <span className="left-input-field-unit">{leftUnit}</span>}
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
          <div className="right-container">
            {RightIcon && <span className="right-input-field-icon">{RightIcon}</span>}
            {rightUnit && <span className="right-input-field-unit">{rightUnit}</span>}
          </div>
        )}
      </div>
      <FormErrorMessage errors={errors} name={attribute} />
    </div>
  );
});