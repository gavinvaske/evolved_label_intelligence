import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { IMaterialCategory } from '@shared/types/models';
import { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { Input } from '../../_global/FormInputs/Input/Input';
import { getOneMaterialCategory } from '../../_queries/materialCategory';
import { IMaterialCategoryForm } from '@ui/types/forms';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'
import { Button } from '../../_global/Button/Button';
import apiClient from '../../_api/apiClient';

const materialCategoryTableUrl = '/react-ui/tables/material-category'

export const MaterialCategoryForm = () => {
  const { mongooseId } = useParams();
  const methods = useForm<IMaterialCategoryForm>();
  const { handleSubmit, formState: { errors }, reset } = methods;
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  useEffect(() => {
    if (!isUpdateRequest) return;

    getOneMaterialCategory(mongooseId)
      .then((materialCategory: IMaterialCategory) => {
        const formValues: IMaterialCategoryForm = {
          name: materialCategory.name
        }
        reset(formValues)
      })
      .catch((error: AxiosError) => {
        navigate(materialCategoryTableUrl)
        useErrorMessage(error)
      })
  }, [])

  const onSubmit = (formData: IMaterialCategoryForm) => {
    if (isUpdateRequest) {
      apiClient.patch(`/material-categories/${mongooseId}`, formData)
        .then((_) => {
          navigate(materialCategoryTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      apiClient.post('/material-categories', formData)
        .then((_: AxiosResponse) => {
          navigate(materialCategoryTableUrl);
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
          <h3>{isUpdateRequest ? 'Update' : 'Create'} Material Category</h3>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} data-test='material-category-form' className={formStyles.form}>
            <div className={formStyles.formElementsWrapper}>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='name'
                  label="Name"
                  isRequired={true}
                  dataAttributes={{ 'data-test': 'material-category-name-input' }}
                />
              </div>

              <Button color="blue" size="large" data-test="material-category-submit">
                {isUpdateRequest ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default MaterialCategoryForm;