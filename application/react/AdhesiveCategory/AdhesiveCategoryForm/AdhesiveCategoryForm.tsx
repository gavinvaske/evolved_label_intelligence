import React from 'react';
import './AdhesiveCategoryForm.scss';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useNavigate } from "react-router-dom";
import flashMessageStore from '../../stores/flashMessageStore';
import { useForm } from 'react-hook-form';
import { AdhesiveCategory } from '../../_types/databaseModels/adhesiveCategory';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useErrorHandler } from '../../_hooks/useErrorHandler';

export const AdhesiveCategoryForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<AdhesiveCategory>();
  const navigate = useNavigate();

  const onFormSubmit = (adhesiveCategory: AdhesiveCategory) => {
    axios.post('/adhesive-categories', adhesiveCategory)
      .then((_: AxiosResponse) => {
        navigate('/react-ui/tables/adhesive-category')
        flashMessageStore.addSuccessMessage('Adhesive Category was created successfully')
      })
      .catch((error: AxiosError) => useErrorHandler(error))
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onFormSubmit)} data-test='adhesive-category-form'>
        <Input
          attribute='name'
          label="Name"
          register={register}
          isRequired={true}
          errors={errors}
        />
        <button className='btn-primary' type="submit">Create Liner Type</button>
      </form>
    </div>
  )
};