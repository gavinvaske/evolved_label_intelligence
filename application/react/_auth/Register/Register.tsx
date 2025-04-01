import { useEffect, useRef } from 'react';
import { Input } from '../../_global/FormInputs/Input/Input';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import * as sharedStyles from '../../_styles/shared.module.scss';
import * as styles from './Register.module.scss';

export const Register = () => {
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    emailFieldRef.current?.focus();
  }, [])

  const onSubmit = (formData: any) => {
    axios.post('/auth/register', formData)
      .then((_: AxiosResponse) => {
        navigate('/react-ui/login', { replace: true });
        useSuccessMessage('Registration was successful! Login to access your new account.')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  return (
    <>
      <div className={styles.registerFrame}>
        <div className={styles.registerContainer}>
          <div className={styles.colLeft}>
            <img className={styles.eliWelcomeSplash} src={'../images/standing-ivy-figure.png'} />
            <img className={styles.grayBackgroundShape} src={'../images/gray-background-smaller.png'} />
          </div>
          <div className={styles.colRight}>
            <div className={styles.registerFormContainer}>

              <div>
                <h4>Hello! Lets get started</h4>
              </div>

              <form className={styles.registerForm} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formContainer}>
                  <div className={styles.formColLeft}>
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
                  <div className={styles.formColRight}>
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
                <div className={styles.buttonContainer}>
                  <button className={sharedStyles.submitButton} type='submit' data-test='login-btn'>Register</button>
                </div>
              </form>

              <div className={styles.registerLinkContainer}>
                Already have an account?
                <Link to='/react-ui/login'>Sign in</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register