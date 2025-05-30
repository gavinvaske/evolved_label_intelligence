import { FieldValues, Path, RegisterOptions, useFormContext } from 'react-hook-form';
import FormErrorMessage from '../../FormErrorMessage/FormErrorMessage';
import * as textStyles from '@ui/styles/typography.module.scss';
import clsx from 'clsx';
import * as styles from './TextArea.module.scss';

type Props<T extends FieldValues> = {
  attribute: Path<T>
  label: string
  isRequired?: boolean,
  placeholder?: string,
  dataAttributes?: { [key: `data-${string}`]: string },
  rows?: number,
  cols?: number
}

export const TextArea = <T extends FieldValues>(props: Props<T>) => {
  const { attribute, label, isRequired, placeholder, dataAttributes, rows, cols } = props;
  const formContext = useFormContext();
  const { register, formState: { errors } } = formContext;

  const testAttribute = {
    'data-test': `input-${attribute}`
  };

  return (
    <div className={styles.textAreaContainer}>
      <label>{label}<span className={clsx(textStyles.textRed, styles.requiredIndicator)}>{isRequired ? '*' : ''}</span></label>
      <textarea
        {...register(attribute,
          { required: isRequired ? "This is required" : undefined } as RegisterOptions
        )}
        placeholder={placeholder}
        name={attribute}
        {...testAttribute}
        {...dataAttributes}
        {...(rows ? { rows: rows } : {})}
        {...(cols ? { cols: cols } : {})}
      />
      <FormErrorMessage errors={errors} name={attribute} />
    </div>
  )
}