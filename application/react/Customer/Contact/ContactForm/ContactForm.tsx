import { FormProvider, useForm } from 'react-hook-form';
import { IContactForm, IAddressForm } from '@ui/types/forms';
import { Input } from '../../../_global/FormInputs/Input/Input';
import { IShippingLocationForm } from '@ui/types/forms';
import { CustomSelect, SelectOption } from '../../../_global/FormInputs/CustomSelect/CustomSelect';
import { TextArea } from '../../../_global/FormInputs/TextArea/TextArea';
import * as formStyles from '@ui/styles/form.module.scss'
import { Button } from '../../../_global/Button/Button';

interface Props {
  onSubmit: (contact: any) => void;
  onCancel: () => void;
  locations: (IAddressForm | IShippingLocationForm)[];
  initialData?: IContactForm;
}

export const ContactForm = (props: Props) => {
  const {
    onSubmit,
    locations,
    initialData
  } = props;

  // Populates the form with the initial data
  const formInitialData = initialData ? {
    ...initialData,
    location: typeof initialData.location === 'object' ? initialData.location.id : initialData.location
  } : {};

  const methods = useForm<IContactForm>({
    defaultValues: formInitialData
  });
  const { handleSubmit } = methods;

  const selectableLocations: SelectOption[] = locations.map((address: IAddressForm | IShippingLocationForm, index: number) => {
    return {
      displayName: `${address.name}: ${address.street}, ${address.city}, ${address.state}, ${address.zipCode}`,
      value: address.id || ''
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