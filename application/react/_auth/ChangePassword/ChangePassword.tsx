import { useEffect, useRef, useState } from 'react';
import { Input } from '../../_global/FormInputs/Input/Input';
import { FormProvider, useForm } from 'react-hook-form';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useNavigate, useParams } from 'react-router-dom';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'
import { PasswordIcon } from '../Login/Login';
import * as styles from './ChangePassword.module.scss'
import { Button } from '../../_global/Button/Button';

export const ChangePassword = () => {
  const newPasswordFieldRef = useRef<HTMLInputElement>(null);
  const methods = useForm();
  const { handleSubmit } = methods;
  const { mongooseId, token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

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

  const handlePasswordIconClicked = () => {
    setShowPassword(!showPassword);
  }

  const handleRepeatPasswordIconClicked = () => {
    setShowRepeatPassword(!showRepeatPassword);
  }

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={formStyles.formCardHeader}>
          <h3>Change Password</h3>
        </div>
        <div>
          <FormProvider {...methods}>
            <form id='change-password-form' className={styles.changePasswordForm} onSubmit={handleSubmit(onSubmit)}>
              <Input
                attribute='password'
                label="New Password"
                isRequired={true}
                ref={newPasswordFieldRef}
                fieldType={showPassword ? 'text' : 'password'}
                dataAttributes={
                  { 'data-test': 'password-input' }
                }
                RightIcon={<PasswordIcon showPassword={showPassword} onClick={handlePasswordIconClicked} />}
              />
              <Input
                attribute='repeatPassword'
                label="Re-type Password"
                isRequired={true}
                ref={newPasswordFieldRef}
                fieldType={showRepeatPassword ? 'text' : 'password'}
                dataAttributes={
                  { 'data-test': 'repeat-password-input' }
                }
                RightIcon={<PasswordIcon showPassword={showRepeatPassword} onClick={handleRepeatPasswordIconClicked} />}
              />
              <Button
                color="blue"
                size="large"
                data-test='change-password-btn'
              >
                Save Password
              </Button>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword;