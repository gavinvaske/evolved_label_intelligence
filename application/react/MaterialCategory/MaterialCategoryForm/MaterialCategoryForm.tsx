import { useEffect } from 'react';
import './MaterialCategoryForm.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { IMaterialCategory } from '@shared/types/models';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { Input } from '../../_global/FormInputs/Input/Input';
import { getOneMaterialCategory } from '../../_queries/materialCategory';
import { IMaterialCategoryForm } from '@ui/types/forms';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'

const materialCategoryTableUrl = '/react-ui/tables/material-category'

export const MaterialCategoryForm = () => {
  const { mongooseId } = useParams();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<IMaterialCategoryForm>();
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
      axios.patch(`/material-categories/${mongooseId}`, formData)
        .then((_) => {
          navigate(materialCategoryTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/material-categories', formData)
        .then((_: AxiosResponse) => {
          navigate(materialCategoryTableUrl);
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  };

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
        <h3>{isUpdateRequest ? 'Update' : 'Create'} Material Category</h3>
        </div>
        <div className='form-wrapper'>
          <form id='material-category-form' onSubmit={handleSubmit(onSubmit)} data-test='material-category-form'>
            <Input
              attribute='name'
              label="Name"
              register={register}
              isRequired={true}
              errors={errors}
            />
            {/* Let user know some form inputs had errors */}
            <p className='red'>{Object.keys(errors).length ? 'Some inputs had errors, please fix before attempting resubmission' : ''}</p>

            <button className='create-entry submit-button' type="submit">{isUpdateRequest ? 'Update' : 'Create'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MaterialCategoryForm;