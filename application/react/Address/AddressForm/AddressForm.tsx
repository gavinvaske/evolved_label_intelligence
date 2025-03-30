import { useForm } from 'react-hook-form';
import { Input } from '../../_global/FormInputs/Input/Input';
import * as formStyles from '@ui/styles/form.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'

interface Props {
  onSubmit: (data: any) => void;
}

export const AddressForm = ({onSubmit}: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <div>
      <div className={formStyles.formCardHeader}>
        <h3>New Address</h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
        <div className={formStyles.formElementsWrapper}>
          <div className={formStyles.inputGroupWrapper}>
            <Input
              attribute='name'
              label="Name"
              register={register}
              isRequired={true}
              errors={errors}
            />
            <Input
              attribute='street'
              label="Street"
              register={register}
              isRequired={true}
              errors={errors}
            />
            <Input
              attribute='unitOrSuite'
              label="Unit or Suite #"
              register={register}
              isRequired={false}
              errors={errors}
            />
            <Input
              attribute='city'
              label="City"
              register={register}
              isRequired={true}
              errors={errors}
            />
            <Input
              attribute='state'
              label="State"
              register={register}
              isRequired={true}
              errors={errors}
            />
            <Input
              attribute='zipCode'
              label="Zip"
              register={register}
              isRequired={true}
              errors={errors}
            />
          </div>
          <button className={sharedStyles.submitButton} type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

