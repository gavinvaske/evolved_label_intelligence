import { FormProvider, useForm } from 'react-hook-form';
import { IContactForm } from '@ui/types/forms';
import { Input } from '../../../_global/FormInputs/Input/Input';
import { CustomSelect, SelectOption } from '../../../_global/FormInputs/CustomSelect/CustomSelect';
import { TextArea } from '../../../_global/FormInputs/TextArea/TextArea';
import * as formStyles from '@ui/styles/form.module.scss'
import { Button } from '../../../_global/Button/Button';
import { BillingLocationForm, BusinessLocationForm, ShippingLocationForm } from '../../CustomerForm/CustomerForm';

interface Props {
  onSubmit: (contact: any) => void;
  onCancel: () => void;
  locations: (ShippingLocationForm | BusinessLocationForm | BillingLocationForm)[];
  initialData?: IContactForm;
}

type SelectableLocation = ShippingLocationForm | BusinessLocationForm | BillingLocationForm;

export const ContactForm = (props: Props) => {
  const {
    onSubmit,
    locations,
    initialData
  } = props;

  const methods = useForm<IContactForm>({
    defaultValues: initialData || {}
  });
  const { handleSubmit } = methods;

  const selectableLocations: SelectOption[] = locations.map((address: SelectableLocation) => {
    return {
      displayName: `${address.name}: ${address.street}, ${address.city}, ${address.state}, ${address.zipCode}`,
      value: address._id
    }
  });

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.formElementsWrapper}>
            <div className={formStyles.inputGroupWrapper}>
              <Input
                attribute='fullName'
                label="Name"
                isRequired={true}
              />
              <Input
                attribute='phoneNumber'
                label="Phone Number"
                isRequired={false}
              />
            </div>
            <div className={formStyles.inputGroupWrapper}>
              <Input
                attribute='phoneExtension'
                label="Phone Extension"
                isRequired={false}
              />
              <Input
                attribute='email'
                label="Email"
                isRequired={false}
              />
              <Input
                attribute='contactStatus'
                label="Contact Status"
                isRequired={true}
              />
            </div>
            <TextArea
              attribute='notes'
              label="Notes"
              isRequired={false}
              placeholder='Enter notes here...'
            />
            <Input
              attribute='position'
              label="Position"
              isRequired={false}
            />
            <CustomSelect
              attribute='location'
              label="Location"
              options={selectableLocations}
              isRequired={false}
            />
            <Button color='blue' size='large' type="submit">
              {initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}