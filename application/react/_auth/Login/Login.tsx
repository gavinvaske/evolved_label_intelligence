import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../_hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Input } from '../../_global/FormInputs/Input/Input';
import { FormProvider, useForm } from 'react-hook-form';
import axios from 'axios';
import { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { FaEyeSlash, FaEye } from "react-icons/fa6";
import { IconBaseProps } from "react-icons";
import * as sharedStyles from '@ui/styles/shared.module.scss';
import * as styles from './Login.module.scss'
import { Button } from '../../_global/Button/Button';

export const Login = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/react-ui/profile";
  const [showPassword, setShowPassword] = useState(false);

  const userRef = useRef<HTMLInputElement>(null);

  const methods = useForm();
  const { handleSubmit } = methods;

  const handlePasswordIconClicked = () => {
    setShowPassword(!showPassword);
  }

  useEffect(() => {
    userRef.current?.focus();
  }, [])

  const onSubmit = (formData: any) => {
    axios.post('/auth/login', formData)
      .then((response: AxiosResponse) => {
        const { data: jsonResponse } = response;
        const { accessToken, authRoles } = jsonResponse;

        if (!accessToken || !authRoles ) {
          console.error('Login error: ', response)
          throw new Error('Missing accessToken and/or roles from login response')
        }

        setAuth({
          accessToken,
          authRoles: authRoles
        })
        navigate(from, { replace: true });
        useSuccessMessage('Welcome to E.L.I')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  return (
    <>
      <div className={styles.loginFrame}>
        <div className={styles.loginContainer}>
          <div className={styles.colLeft}>
            <div className={styles.logoHeaderContainer}>
            <svg
              id="Layer_2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 106 109.52">
              <defs>
              <style>
                {
                ".cls-1{fill:#7367f0;stroke-width:0px;}.cls-2{fill:none;opacity:.9;stroke:#7367f0;stroke-miterlimit:10;}"
                }
              </style>
              </defs>
              <g id="Layer_1-2">
              <line className="cls-2" x1={23} y1={22} x2={42.5} y2={29.5} />
              <line className="cls-2" x1={42.5} y1={29.5} x2={79.5} y2={53.5} />
              <line className="cls-2" x1={32.5} y1={46.5} x2={52.5} y2={56.5} />
              <line className="cls-2" x1={13.5} y1={39.5} x2={32.5} y2={46.5} />
              <line className="cls-2" x1={53.5} y1={55.5} x2={75.5} y2={76.5} />
              <line className="cls-2" x1={55.5} y1={85.5} x2={77.39} y2={93.19} />
              <line className="cls-2" x1={5.5} y1={67.5} x2={31.5} y2={70.5} />
              <line className="cls-2" x1={12.39} y1={43.19} x2={31.5} y2={70.5} />
              <line className="cls-2" x1={31.5} y1={71.5} x2={55.5} y2={104.5} />
              <line className="cls-2" x1={32.5} y1={71.5} x2={54.5} y2={85.5} />
              <line className="cls-2" x1={80.5} y1={53.5} x2={99.5} y2={71.5} />
              <line className="cls-2" x1={66.5} y1={29.5} x2={79.5} y2={53.5} />
              <line className="cls-2" x1={67.5} y1={29.5} x2={97.5} y2={37.5} />
              <line className="cls-2" x1={32.5} y1={45.5} x2={32.5} y2={70.5} />
              <line className="cls-2" x1={43.5} y1={29.5} x2={53.5} y2={55.5} />
              <line className="cls-2" x1={66.5} y1={29.5} x2={53.5} y2={55.5} />
              <line className="cls-2" x1={53.5} y1={55.5} x2={54.5} y2={85.5} />
              <line className="cls-2" x1={77.5} y1={76.5} x2={82.5} y2={93.5} />
              <line className="cls-2" x1={44.5} y1={28.5} x2={67.5} y2={29.5} />
              <line className="cls-2" x1={42.5} y1={29.5} x2={78.5} y2={14.5} />
              <line className="cls-2" x1={78.5} y1={14.5} x2={67.5} y2={29.5} />
              <line className="cls-2" x1={46.5} y1={4.5} x2={43.5} y2={29.5} />
              <line className="cls-2" x1={42.5} y1={29.5} x2={32.5} y2={46.5} />
              <line className="cls-2" x1={9.5} y1={36.5} x2={42.5} y2={29.5} />
              <line className="cls-2" x1={97.5} y1={37.5} x2={77.5} y2={75.5} />
              <line className="cls-2" x1={97.5} y1={37.5} x2={79.5} y2={53.5} />
              <line className="cls-2" x1={52.5} y1={56.5} x2={79.5} y2={53.5} />
              <line className="cls-2" x1={26.5} y1={95.5} x2={55.5} y2={85.5} />
              <line className="cls-2" x1={31.5} y1={71.5} x2={53.5} y2={55.5} />
              <line className="cls-2" x1={54.5} y1={85.5} x2={80.5} y2={53.5} />
              <line className="cls-2" x1={54.5} y1={85.5} x2={55.5} y2={105.5} />
              <line className="cls-2" x1={55.5} y1={85.5} x2={77.5} y2={75.5} />
              <line className="cls-2" x1={77.5} y1={76.5} x2={99.5} y2={71.5} />
              <line className="cls-2" x1={24.5} y1={94.5} x2={31.5} y2={69.5} />
              <circle className="cls-1" cx={46} cy={8} r={8} />
              <circle className="cls-1" cx={98} cy={37} r={8} />
              <circle className="cls-1" cx={53} cy={57} r={8} />
              <circle className="cls-1" cx={8} cy={38} r={8} />
              <circle className="cls-1" cx={24} cy={96} r={8} />
              <circle className="cls-1" cx={83} cy={95} r={8} />
              <circle className="cls-1" cx={67.45} cy={28.84} r={4.55} />
              <circle className="cls-1" cx={79.89} cy={53.69} r={4.55} />
              <circle className="cls-1" cx={54.89} cy={85.69} r={4.55} />
              <circle className="cls-1" cx={42.89} cy={29.69} r={4.55} />
              <circle className="cls-1" cx={20.17} cy={20.97} r={3.83} />
              <circle className="cls-1" cx={78.89} cy={14.69} r={3.83} />
              <circle className="cls-1" cx={99.89} cy={71.69} r={3.83} />
              <circle className="cls-1" cx={76.89} cy={76.69} r={3.83} />
              <circle className="cls-1" cx={55.89} cy={105.69} r={3.83} />
              <circle className="cls-1" cx={31.89} cy={46.69} r={3.83} />
              <circle className="cls-1" cx={5.89} cy={67.69} r={3.83} />
              <circle className="cls-1" cx={31} cy={71} r={7} />
              </g>
              </svg>
              <span>ELI</span>
            </div>
            <img className={styles.eliWelcomeSplash} src={'../images/eli-welcome-splash.png'} />
            <img className={styles.grayBackgroundShape} src={'../images/gray-background-shape.png'} />
          </div>
          <div className={styles.colRight}>
            <div className={styles.loginFormContainer}>
              <div className={styles.welcomeContainer}>
                <h4>Welcome to ELI.</h4>
                <p>Please sign in below.</p>
              </div>
              <FormProvider {...methods}>
                <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
                  <div className={styles.inputWrapper}>
                    <Input
                        attribute='email'
                        label="Email"
                        isRequired={true}
                        placeholder='example@gmail.com'
                        ref={userRef}
                        dataAttributes={
                          {'data-test': 'username-input'}
                        }
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <Input
                        attribute='password'
                        label="Password"
                        isRequired={true}
                        fieldType={showPassword ? 'text' : 'password'}
                        dataAttributes={
                          {'data-test': 'password-input'}
                        }
                        RightIcon={<PasswordIcon showPassword={showPassword} onClick={handlePasswordIconClicked} />}
                    />
                  </div>
                  <div className={styles.rememberResetContainer}>
                    <div className={styles.checkboxContainer}>
                      <input type="checkbox" id="remember" name="remember" value=""></input>
                      <label htmlFor="remember"> Remember me</label>
                    </div>
                    <div>
                      <Link to='/react-ui/forgot-password' id='forgot-password-btn'>Forgot Password?</Link>
                    </div>
                  </div>
                  <Button color='blue' size='large' type='submit' data-test='login-btn'>Login</Button>
                </form>
                
                <div className={styles.registerLinkContainer}>
                  Don't have an account?
                  <Link to='/react-ui/register'>Create Account</Link>
                </div>
              </FormProvider>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

interface PasswordIconProps extends IconBaseProps {
  showPassword: boolean;
}

export const PasswordIcon: React.FC<PasswordIconProps> = ({ showPassword, ...rest }) => {
  return showPassword ? (
    <FaEye {...rest} />
  ) : (
    <FaEyeSlash {...rest} />
  );
};

export default Login;