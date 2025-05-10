import { FormProvider, useForm } from 'react-hook-form';
import { Input } from '../../_global/FormInputs/Input/Input';
import * as formStyles from '@ui/styles/form.module.scss'
import { IAddressForm } from '@ui/types/forms';
import { Button } from '../../_global/Button/Button';

interface Props {
  onSubmit: (data: any) => void;
  initialData?: IAddressForm;
}

export const AddressForm = ({ onSubmit, initialData }: Props) => {
  const methods = useForm<IAddressForm>({
    defaultValues: initialData || {}
  });
  const { handleSubmit } = methods;

  return (
    <div>
      <FormProvider {...methods}>
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
            <Button color="blue" size="large">
              {initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

