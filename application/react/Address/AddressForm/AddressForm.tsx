import { FormProvider, useForm } from 'react-hook-form';
import { Input } from '../../_global/FormInputs/Input/Input';
import * as formStyles from '@ui/styles/form.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'
import { IAddressForm } from '@ui/types/forms';

interface Props {
  onSubmit: (data: any) => void;
}

export const AddressForm = ({ onSubmit }: Props) => {
  const methods = useForm<IAddressForm>();
  const { handleSubmit } = methods;

  return (
    <div>
      <FormProvider {...methods}>
        <div className={formStyles.formCardHeader}>
          <h3>New Address</h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.formElementsWrapper}>
            <div className={formStyles.inputGroupWrapper}>
              <Input
                attribute='name'
                label="Name"
                isRequired={true}
              />
              <Input
                attribute='street'
                label="Street"
                isRequired={true}
              />
              <Input
                attribute='unitOrSuite'
                label="Unit or Suite #"
                isRequired={false}
              />
              <Input
                attribute='city'
                label="City"
                isRequired={true}
              />
              <Input
                attribute='state'
                label="State"
                isRequired={true}
              />
              <Input
                attribute='zipCode'
                label="Zip"
                isRequired={true}
              />
            </div>
            <button className={sharedStyles.submitButton} type="submit">Submit</button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

