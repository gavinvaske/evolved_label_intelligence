import React, { useEffect } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import './LinerTypeForm.scss';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from "react-router-dom";
import { Input } from '../../_global/FormInputs/Input/Input';
import { getOneLinerType } from '../../_queries/linerType';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { ILinerType } from '@shared/types/models';

const linerTypeTableUrl = '/react-ui/tables/liner-type'

export const LinerTypeForm = () => {
  const { mongooseId } = useParams();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LinerTypeFormAttributes>();
  const navigate = useNavigate();

  const isUpdateRequest = mongooseId && mongooseId.length > 0;

  useEffect(() => {
    if (!isUpdateRequest) return;

    getOneLinerType(mongooseId)
      .then((linerType: ILinerType) => {
        const formValues: LinerTypeFormAttributes = {
          name: linerType.name
        }
        reset(formValues)
      })
      .catch((error: AxiosError) => {
        navigate(linerTypeTableUrl)
        useErrorMessage(error)
      })
  }, [])

  const onSubmit = (formData: LinerTypeFormAttributes) => {
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

  return (
    <div className='page-container'>
      <div className='form-card'>
        <div className='form-card-header'>
        <h3>{isUpdateRequest ? 'Update' : 'Create'} Liner Type</h3>
        </div>
        <div className='form-wrapper'>
          <form id='liner-type-form' onSubmit={handleSubmit(onSubmit)} data-test='liner-type-form'>
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

export type LinerTypeFormAttributes = {
  name: String
}
