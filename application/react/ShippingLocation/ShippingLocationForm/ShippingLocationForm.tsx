import { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { FormProvider, useForm } from 'react-hook-form';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { IShippingLocationForm } from '@ui/types/forms.ts';
import { CustomSelect, SelectOption } from '../../_global/FormInputs/CustomSelect/CustomSelect.tsx';
import { IDeliveryMethod } from '@shared/types/models.ts';
import * as formStyles from '@ui/styles/form.module.scss'
import { Button } from '../../_global/Button/Button.tsx';

interface Props {
  onSubmit: (data: IShippingLocationForm) => void;
  initialData?: IShippingLocationForm;
}

export const ShippingLocationForm = (props: Props) => {
  const {
    onSubmit,
    initialData
  } = props;

  const methods = useForm<IShippingLocationForm>({
    defaultValues: initialData || {}
  });
  const { handleSubmit } = methods;

  const [deliveryMethods, setDeliveryMethods] = useState<SelectOption[]>([]);

  useEffect(() => {
    axios.get('/delivery-methods')
      .then((response: AxiosResponse) => {
        const deliveryMethods: IDeliveryMethod[] = response.data;

        setDeliveryMethods(deliveryMethods.map((deliveryMethod: IDeliveryMethod) => (
          {
            displayName: deliveryMethod.name,
            value: deliveryMethod._id as string
          }
        )))
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }, [])

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form} data-test='shipping-location-form'>
          <div className={formStyles.formElementsWrapper}>
            <div className={formStyles.inputGroupWrapper}>
              <Input
                attribute='name'
                label="Name"
                isRequired={true}
              />
              <Input
                attribute='freightAccountNumber'
                label="Freight Account Number"
                isRequired={true}
              />
              <CustomSelect
                attribute='deliveryMethod'
                label="Delivery Method"
                options={deliveryMethods}
                isRequired={false}
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