import { useEffect, useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useForm } from 'react-hook-form';
import './ShippingLocationForm.scss'
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { IShippingLocationForm } from '@ui/types/forms.ts';
import { CustomSelect, SelectOption } from '../../_global/FormInputs/CustomSelect/CustomSelect.tsx';
import { IDeliveryMethod } from '@shared/types/models.ts';
import * as formStyles from '@ui/styles/form.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'

interface Props {
  onSubmit: (data: IShippingLocationForm) => void
}

export const ShippingLocationForm = (props: Props) => {
  const { 
    onSubmit,
  } = props;

  const [ deliveryMethods, setDeliveryMethods ] = useState<SelectOption[]>([]);

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
  
  const { register, handleSubmit, formState: { errors }, control } = useForm<IShippingLocationForm>();

  return (
    <div>
      <div className={formStyles.formCardHeader}>
        <h3>New Shipping Address</h3>
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
            attribute='freightAccountNumber'
            label="Freight Account Number"
            register={register}
            isRequired={true}
            errors={errors}
          />
          <CustomSelect
            attribute='deliveryMethod'
            label="Delivery Method"
            options={deliveryMethods}
            register={register}
            isRequired={false}
            errors={errors}
            control={control}
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