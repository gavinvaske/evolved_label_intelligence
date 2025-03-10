import React, { forwardRef } from 'react';
import './Input.scss'
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';


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
        {LeftIcon && !leftUnit && <div className="left-input-field-icon">{LeftIcon}</div>}
        {leftUnit && !LeftIcon && <div className="left-input-field-unit">{leftUnit}</div>}
        
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
          className={`
            ${LeftIcon || leftUnit ? 'has-left-element' : ''} 
            ${RightIcon || rightUnit ? 'has-right-element' : ''}
          `}
          {...dataAttributes}
        />
        
        {RightIcon && !rightUnit && <div className="right-input-field-icon">{RightIcon}</div>}
        {rightUnit && !RightIcon && <div className="right-input-field-unit">{rightUnit}</div>}
      </div>
      <FormErrorMessage errors={errors} name={attribute} />
    </div>
  );
});