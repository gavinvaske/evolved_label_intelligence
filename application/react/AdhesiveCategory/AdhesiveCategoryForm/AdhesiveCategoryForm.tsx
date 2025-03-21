import React, { useEffect } from 'react';
import './AdhesiveCategoryForm.scss';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { getOneAdhesiveCategory } from '../../_queries/adhesiveCategory';
import { IAdhesiveCategory } from '@shared/types/models.ts';
import { IAdhesiveCategoryForm } from '@ui/types/forms';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'

const adhesiveCategoryTableUrl = '/react-ui/tables/adhesive-category'

export const AdhesiveCategoryForm = () => {
  const { mongooseId } = useParams();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<IAdhesiveCategoryForm>();
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  useEffect(() => {
    if (!isUpdateRequest) return;

    getOneAdhesiveCategory(mongooseId)
      .then((adhesiveCategory: IAdhesiveCategory) => {
        const formValues: IAdhesiveCategoryForm = {
          name: adhesiveCategory.name
        }
        reset(formValues)
      })
      .catch((error: AxiosError) => {
        navigate(adhesiveCategoryTableUrl)
        useErrorMessage(error)
      })
  }, [])

  const onSubmit = (formData: IAdhesiveCategoryForm) => {
    if (isUpdateRequest) {
      axios.patch(`/adhesive-categories/${mongooseId}`, formData)
        .then((_) => {
          navigate(adhesiveCategoryTableUrl)
          useSuccessMessage('Update was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error));
    } else {
      axios.post('/adhesive-categories', formData)
        .then((_: AxiosResponse) => {
          navigate(adhesiveCategoryTableUrl);
          useSuccessMessage('Creation was successful')
        })
        .catch((error: AxiosError) => useErrorMessage(error))
    }
  };

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
          <h3>{isUpdateRequest ? 'Update' : 'Create'} Adhesive Category</h3>
        </div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)} data-test='adhesive-category-form' className={formStyles.form}>
            <div className={formStyles.formElementsWrapper}>
              <div className={formStyles.inputGroupWrapper}>
                <Input
                  attribute='name'
                  label="Name"
                  register={register}
                  isRequired={true}
                  errors={errors}
                />
              </div>
              {/* Let user know some form inputs had errors */}
              <p className='red'>{Object.keys(errors).length ? 'Some inputs had errors, please fix before attempting resubmission' : ''}</p>

              <button className='create-entry submit-button' type="submit">{isUpdateRequest ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdhesiveCategoryForm;