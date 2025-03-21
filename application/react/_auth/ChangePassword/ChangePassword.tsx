import { useEffect, useRef } from 'react';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useForm } from 'react-hook-form';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useNavigate, useParams } from 'react-router-dom';
import * as sharedStyles from '@ui/styles/shared.module.scss';

export const ChangePassword = () => {
  const newPasswordFieldRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { mongooseId, token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    newPasswordFieldRef.current?.focus();
  }, [])

  const onSubmit = (formData: any) => {
    axios.post(`/auth/change-password/${mongooseId}/${token}`, formData)
      .then((error: AxiosResponse) => {
        navigate('/react-ui/login');
        useSuccessMessage('Password changed successfully. Please log in again.');
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  return (
    <form id='change-password-form' onSubmit={ handleSubmit(onSubmit) }>
    <Input
        attribute='password'
        label="New Password"
        register={register}
        isRequired={true}
        errors={errors}
        ref={newPasswordFieldRef}
        fieldType='password'
        dataAttributes={
          {'data-test': 'password-input'}
        }
    />
    <Input
        attribute='repeatPassword'
        label="Re-type Password"
        register={register}
        isRequired={true}
        errors={errors}
        ref={newPasswordFieldRef}
        fieldType='password'
        dataAttributes={
          {'data-test': 'repeat-password-input'}
        }
    />
    <button className={sharedStyles.submitButton} type='submit' data-test='change-password-btn'>Save Password</button>
  </form>
  )
}

export default ChangePassword;