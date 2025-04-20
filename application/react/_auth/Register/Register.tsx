import { useEffect, useRef } from 'react';
import { Input } from '../../_global/FormInputs/Input/Input';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import * as sharedStyles from '../../_styles/shared.module.scss';
import * as styles from './Register.module.scss';

export const Register = () => {
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const methods = useForm();
  const { handleSubmit } = methods;

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

              <div className={styles.registerFormHeader}>
                <h4>Hello! Lets get started</h4>
              </div>

              <FormProvider {...methods}>
                <form className={styles.registerForm} onSubmit={handleSubmit(onSubmit)}>
                  <div className={styles.formContainer}>
                    <div className={styles.formColLeft}>
                      <Input
                        attribute='firstName'
                        label="First Name"
                        isRequired={true}
                      />
                      <Input
                        attribute='lastName'
                        label="Last Name"
                        isRequired={true}
                      />
                      <Input
                        attribute='birthDate'
                        label="Birth Date"
                        isRequired={true}
                        fieldType='date'
                      />
                    </div>
                    <div className={styles.formColRight}>
                      <Input
                        attribute='email'
                        label="Email"
                        isRequired={true}
                        ref={emailFieldRef}
                      />
                      <Input
                        attribute='password'
                        label="Password"
                        isRequired={true}
                        fieldType='password'
                      />
                      <Input
                        attribute='repeatPassword'
                        label="Re-type Password"
                        isRequired={true}
                        fieldType='password'
                      />
                    </div>
                  </div>
                  <div className={styles.buttonContainer}>
                    <button className={sharedStyles.submitButton} type='submit' data-test='login-btn'>Register</button>
                  </div>
                </form>
              </FormProvider>
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