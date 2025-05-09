import { useEffect } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from "react-router-dom";
import { Input } from '../../_global/FormInputs/Input/Input';
import { getOneLinerType } from '../../_queries/linerType';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { ILinerType } from '@shared/types/models';
import { ILinerTypeForm } from '@ui/types/forms';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'
import { Button } from '../../_global/Button/Button';

const linerTypeTableUrl = '/react-ui/tables/liner-type'

export const LinerTypeForm = () => {
  const { mongooseId } = useParams();
  const methods = useForm<ILinerTypeForm>();
  const { handleSubmit, formState: { errors }, reset } = methods;
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  useEffect(() => {
    if (!isUpdateRequest) return;

    getOneLinerType(mongooseId)
      .then((linerType: ILinerType) => {
        const formValues: ILinerTypeForm = {
          name: linerType.name
        }
        reset(formValues)
      })
      .catch((error: AxiosError) => {
        navigate(linerTypeTableUrl)
        useErrorMessage(error)
      })
  }, [])

  const onSubmit = (formData: ILinerTypeForm) => {
    if (isUpdateRequest) {
      axios.patch(`/liner-types/${mongooseId}`, formData)
        .then((_) => {
          navigate(linerTypeTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/liner-types', formData)
        .then((_: AxiosResponse) => {
          navigate(linerTypeTableUrl);
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length) {
      useErrorMessage(new Error('Some inputs had errors, please fix before attempting resubmission'))
    }
  }, [errors])

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
          <h3>{isUpdateRequest ? 'Update' : 'Create'} Liner Type</h3>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} data-test='liner-type-form' className={formStyles.form}>
            <div className={formStyles.formElementsWrapper}>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='name'
                  label="Name"
                  isRequired={true}
                />
              </div>

              <Button color="blue" size="large" data-test='submit-button'>
                {isUpdateRequest ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default LinerTypeForm;