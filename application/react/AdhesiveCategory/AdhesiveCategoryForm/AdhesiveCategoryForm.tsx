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

const adhesiveCategoryTableUrl = '/react-ui/tables/adhesive-category'

export const AdhesiveCategoryForm = () => {
  const { mongooseId } = useParams();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AdhesiveCategoryFormAttributes>();
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  useEffect(() => {
    if (!isUpdateRequest) return;

    getOneAdhesiveCategory(mongooseId)
      .then((adhesiveCategory: IAdhesiveCategory) => {
        const formValues: AdhesiveCategoryFormAttributes = {
          name: adhesiveCategory.name
        }
        reset(formValues)
      })
      .catch((error: AxiosError) => {
        navigate(adhesiveCategoryTableUrl)
        useErrorMessage(error)
      })
  }, [])

  const onSubmit = (formData: AdhesiveCategoryFormAttributes) => {
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
    <div className='page-container'>
      <div className='form-card'>
        <div className='form-card-header'>
        <h3>{isUpdateRequest ? 'Update' : 'Create'} Adhesive Category</h3>
        </div>
        <div className='form-wrapper'>
          <form id='adhesive-category-form' onSubmit={handleSubmit(onSubmit)} data-test='adhesive-category-form'>
            <Input
              attribute='name'
              label="Name"
              register={register}
              isRequired={true}
              errors={errors}
            />
            <button className='create-entry submit-button' type="submit">{isUpdateRequest ? 'Update' : 'Create'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export type AdhesiveCategoryFormAttributes = {
  name: string; 
}