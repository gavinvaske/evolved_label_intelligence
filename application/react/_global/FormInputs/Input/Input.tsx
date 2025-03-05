import React, { forwardRef } from 'react';
import './Input.scss'
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';

type Props<T extends FieldValues> = {
  attribute: Path<T>
  label: string
  register: UseFormRegister<T>
  errors: FieldErrors,
  placeholder?: string
  isRequired?: boolean
  additionalRegisterOptions?: any
  onChange?: () => void,
  fieldType?: 'text' | 'checkbox' | 'date' | 'password' | 'currency' | 'percent',
  ref?: any,
  dataAttributes?: { [key: `data-${string}`]: string },
  unit?: string,
  Icon: React.ReactNode
}

/* This "solution" was found here to solve hard-to-fix typescript errors resulting from usage of forwardRef(..): https://stackoverflow.com/a/73795494 */
interface WithForwardRefType extends React.FC<Props<FieldValues>>  {
  <T extends FieldValues>(props: Props<T>): ReturnType<React.FC<Props<T>>>
}

/* @Gavin More client side validation rules can be configured in react-hook-form. see https://react-hook-form.com/get-started#Applyvalidation */
export const Input: WithForwardRefType = forwardRef((props, customRef) => {
  const { placeholder, errors, attribute, label, register, isRequired, fieldType, dataAttributes, unit, Icon } = props

  const { ref, ...rest } = register(attribute,
    { required: isRequired ? "This is required" : undefined }
  );

  const displayedUnit = (fieldType === 'currency' || unit) ? `(${fieldType === 'currency' ? '$' : unit || ''})` : '';


  return (
    <div className='input-wrapper'>
      <label>{label} {displayedUnit}<span className='red'>{isRequired ? '*' : ''}</span>:</label>
      <input
        {...rest}
        type={fieldType ? fieldType : 'text'}
        placeholder={placeholder}
        ref={(e) => {   // solution from https://stackoverflow.com/a/71497701
          ref(e)
          if (customRef) {
            customRef.current = e
          }
        }}
        {...dataAttributes}
      />
      {Icon && <div className='input-field-icon'>{Icon}</div>}

      <FormErrorMessage errors={errors} name={attribute} />
    </div>
  )
})