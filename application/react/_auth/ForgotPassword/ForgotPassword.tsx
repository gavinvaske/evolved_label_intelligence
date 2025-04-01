import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { Input } from '../../_global/FormInputs/Input/Input';
import { useNavigate } from 'react-router-dom';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as styles from './ForgotPassword.module.scss'

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
    <div className={styles.forgotPasswordFrame}>
      <div className={styles.forgotPasswordContainer}>
        <div className={styles.colLeft}>
          <img className={styles.eliWelcomeSplash} src={'../images/eli-welcome-register-splash.png'} />
          <img className={styles.grayBackgroundShape} src={'../images/gray-background-shape.png'} />
        </div>
        <div className={styles.colRight}>
          <div className={styles.forgotPasswordFormContainer}>
            <div>
              <h4>Forgot Password? 🔒</h4>
              <p>Enter your email and we'll send you instructions to reset your password.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                attribute='email'
                label="Email"
                register={register}
                isRequired={true}
                errors={errors}
                ref={resetPasswordFieldRef}
                dataAttributes={
                  { 'data-test': 'email-input' }
                }
              />
              <button className={sharedStyles.submitButton} type='submit' data-test='reset-password-btn'>Reset</button>
            </form>
            <div>
              <a href='/react-ui/login'>Back to login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword