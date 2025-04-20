import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { getOneDeliveryMethod } from '../../_queries/deliveryMethod';
import { DeliveryMethod } from '../../_types/databasemodels/deliveryMethod.ts';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { IDeliveryMethodForm } from '@ui/types/forms.ts';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'

const deliveryMethodTableUrl = '/react-ui/tables/delivery-method'

export const DeliveryMethodForm = () => {
  const { mongooseId } = useParams();
  const methods = useForm<IDeliveryMethodForm>();
  const { handleSubmit, reset } = methods;
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  useEffect(() => {
    if (!isUpdateRequest) return;

    getOneDeliveryMethod(mongooseId)
      .then((deliveryMethod: DeliveryMethod) => {
        const formValues: IDeliveryMethodForm = {
          name: deliveryMethod.name
        }
        reset(formValues)
      })
      .catch((error: AxiosError) => {
        navigate(deliveryMethodTableUrl)
        useErrorMessage(error)
      })
  }, [])

  const onSubmit = (formData: IDeliveryMethodForm) => {
    if (isUpdateRequest) {
      axios.patch(`/delivery-methods/${mongooseId}`, formData)
        .then((_) => {
          navigate(deliveryMethodTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/delivery-methods', formData)
        .then((_: AxiosResponse) => {
          navigate(deliveryMethodTableUrl);
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  };

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
          <h3>{isUpdateRequest ? 'Update' : 'Create'} Delivery Method</h3>
        </div>
        <div>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} data-test='delivery-method-form' className={formStyles.form}>
              <div className={formStyles.formElementsWrapper}>
                <div className={formStyles.inputGroupWrapper}>
                  <Input
                  attribute='name'
                  label="Name"
                  isRequired={true}
                />
              </div>
              <button className={sharedStyles.submitButton} type='submit'>{isUpdateRequest ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}

export default DeliveryMethodForm;