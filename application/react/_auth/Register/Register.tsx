import React, { useEffect, useRef } from 'react';
import './Register.scss';
import { Input } from '../../_global/FormInputs/Input/Input';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';

export const Register = () => {
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    emailFieldRef.current?.focus();
  }, [])

  const onSubmit = (formData: any) => {
    axios.post('/auth/register', formData)
      .then((response: AxiosResponse) => {
        navigate('/react-ui/login', { replace: true });
        useSuccessMessage('Registration was successful! Login to access your new account.')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  return (
    <>
      <div className='register-frame'>
        <div className='register-container'>
          <div className='col-left'>
            <img className='eli-welcome-splash' src={'../images/standing-ivy-figure.png'} />
            <img className='gray-background-shape' src={'../images/gray-background-smaller.png'} />
          </div>
          <div className='col-right'>
            <div className='register-form-container'>

              <div className='welcome-container'>
                <h4>Hello! Lets get started</h4>
              </div>

              <form id='register-form' onSubmit={handleSubmit(onSubmit)}>
                <div className='form-container'>
                  <div className='form-col-left'>
                    <Input
                        attribute='firstName'
                        label="First Name"
                        register={register}
                        isRequired={true}
                        errors={errors}
                    />
                    <Input
                        attribute='lastName'
                        label="Last Name"
                        register={register}
                        isRequired={true}
                        errors={errors}
                    />
                    <Input
                        attribute='birthDate'
                        label="Birth Date"
                        register={register}
                        isRequired={true}
                        errors={errors}
                        fieldType='date'
                    />
                  </div>
                  <div className='form-col-right'>
                    <Input
                        attribute='email'
                        label="Email"
                        register={register}
                        isRequired={true}
                        errors={errors}
                        ref={emailFieldRef}
                    />
                    <Input
                        attribute='password'
                        label="Password"
                        register={register}
                        isRequired={true}
                        errors={errors}
                        fieldType='password'
                    />
                    <Input
                        attribute='repeatPassword'
                        label="Re-type Password"
                        register={register}
                        isRequired={true}
                        errors={errors}
                        fieldType='password'
                    />
                  </div>
                </div>
                <div className='button-container'>
                  <button className='create-entry submit-button' type='submit' data-test='login-btn'>Register</button>
                </div>
              </form>

              <div className='register-link-container'>
                Already have an account?
                <Link to='/react-ui/login' id='register-btn'>Sign in</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register