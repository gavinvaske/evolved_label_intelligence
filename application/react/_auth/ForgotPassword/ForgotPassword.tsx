import React, { useEffect, useRef } from 'react';
import './ForgotPassword.scss';
import { useForm } from 'react-hook-form';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {
  const resetPasswordFieldRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    resetPasswordFieldRef.current?.focus();
  }, [])

  const onSubmit = (formData: any) => {
    axios.post('/auth/forgot-password', formData)
      .then((_: AxiosResponse) => {
        navigate('/react-ui/login');
        useSuccessMessage('If the email was associated to an account, then a password reset link was sent to your email. Please check your INBOX or SPAM folder.');
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  return (
    <div className='forgot-password-frame'>
      <div className='forgot-password-container'>
        <div className='col-left'>
        <img className='eli-welcome-splash' src={'../images/eli-welcome-register-splash.png'} />
            <img className='gray-background-shape' src={'../images/gray-background-shape.png'} />
        </div>
        <div className='col-right'>
          <div className='forgot-password-form-container'>
            <div className='welcome-container'>
              <h4>Forgot Password? 🔒</h4>
              <p>Enter your email and we'll send you instructions to reset your password.</p>
            </div>
            <form id='reset-password-form' onSubmit={ handleSubmit(onSubmit) }>
            <Input
                attribute='email'
                label="Email"
                register={register}
                isRequired={true}
                errors={errors}
                ref={resetPasswordFieldRef}
                dataAttributes={
                  {'data-test': 'email-input'}
                }
            />
            <button className='create-entry submit-button' type='submit' data-test='reset-password-btn'>Reset</button>
          </form>
          <div className='register-link-container'>
            <a href='/react-ui/register' id='register-btn'>Back to login</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default ForgotPassword