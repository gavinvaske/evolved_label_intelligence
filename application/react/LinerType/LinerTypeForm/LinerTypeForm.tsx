import React, { useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import './LinerTypeForm.scss';
import { LinerTypeForm as LinerTypeFormAttributes } from '../../_types/forms/linerType';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from "react-router-dom";
import flashMessageStore from '../../stores/flashMessageStore';
import { Input } from '../../_global/FormInputs/Input/Input';
import { LinerType } from '../../_types/databaseModels/linerType';
import { getOneLinerType } from '../../_queries/linerType';
import { useErrorHandler } from '../../_hooks/useErrorHandler';

export const LinerTypeForm = () => {
  const { mongooseId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LinerTypeFormAttributes>({});

  useEffect(() => {
    if (!mongooseId) return;

    getOneLinerType(mongooseId)
      .then((linerType: LinerType) => {
        const formValues = {
          name: linerType.name
        }
        reset(formValues)
      })
      .catch((error: AxiosError) => {
        useErrorHandler(error)
        navigate('/react-ui/tables/liner-type')
      })
  }, [])

  const onFormSubmit = (linerType: LinerTypeFormAttributes) => {
    const isUpdateRequest = Boolean(mongooseId);

    if (isUpdateRequest) {
      axios.patch(`/liner-types/${mongooseId ? mongooseId : ''}`, linerType)
        .then((_) => {
          navigate('/react-ui/tables/liner')
        })
        .catch((error: AxiosError) => useErrorHandler(error));
    } else {
      axios.post('/liner-types', linerType)
        .then((_) => {
          navigate('/react-ui/tables/liner-type')
          flashMessageStore.addSuccessMessage('Liner type was created successfully')
        })
        .catch((error: AxiosError) => useErrorHandler(error));
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onFormSubmit)} data-test='liner-type-form'>
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
}
