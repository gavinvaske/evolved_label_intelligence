import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage';
import textStyles from '@ui/styles/typography.module.scss';
type Props<T extends FieldValues> = {
  attribute: Path<T>
  label: string
  register: UseFormRegister<T>
  errors: FieldErrors,
  isRequired?: boolean,
  placeholder?: string,
  dataAttributes?: { [key: `data-${string}`]: string },
  rows?: number,
  cols?: number
}

export const TextArea = <T extends FieldValues>(props: Props<T>) => {
  const { attribute, label, register, errors, isRequired, placeholder, dataAttributes, rows, cols } = props;

  const { ...rest } = register(attribute,
    { required: isRequired ? "This is required" : undefined }
  );

  return (
    <div>
      <label>{label}<span className={textStyles.textRed}>{isRequired ? '*' : ''}</span>:</label>
      <textarea
        {...register(attribute,
          { required: isRequired ? "This is required" : undefined }
        )}
        placeholder={placeholder}
        name={attribute}
        {...dataAttributes}
        {...(rows ? { rows: rows } : {})}
        {...(cols ? { cols: cols } : {})}
      />
      <FormErrorMessage errors={errors} name={attribute} />
    </div>
  )
}