import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { FormProvider, useForm } from 'react-hook-form';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { Input } from '../../_global/FormInputs/Input/Input';
import { UploadProfilePicture } from '../../UploadProfilePicture/UploadProfilePicture';
import { refreshLoggedInUser, useLoggedInUser } from '../../_hooks/useLoggedInUser';
import { convertDateStringToFormInputDateString } from '../../_helperFunctions/dateTime';
import { IUserForm } from '@ui/types/forms';
import { LoadingIndicator } from '../../_global/LoadingIndicator/LoadingIndicator';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as styles from './Profile.module.scss'
import { Button } from '../../_global/Button/Button';

export const Profile = () => {
  const queryClient = useQueryClient()
  const { user: loggedInUser, isLoading: isLoadingUser, isFetching: isFetchingUser, error } = useLoggedInUser();

  const methods = useForm<IUserForm>();
  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset({
      email: loggedInUser?.email || '',
      firstName: loggedInUser?.firstName || '',
      lastName: loggedInUser?.lastName || '',
      birthDate: loggedInUser?.birthDate ? convertDateStringToFormInputDateString(loggedInUser?.birthDate as string) : '',
      phoneNumber: loggedInUser?.phoneNumber || '',
      jobRole: loggedInUser?.jobRole || ''
    })
  }, [loggedInUser])

  if (error) {
    useErrorMessage(error)
  }

  const onSubmit = (formData: any) => {
    axios.patch(`/users/me`, formData)
      .then((_: AxiosResponse) => {
        refreshLoggedInUser(queryClient);
        useSuccessMessage('Update was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileHeaderContainer}>
        <div className={styles.profileCanvasBackground}></div>
        <div className={styles.profileDetailsFooter}>
          <UploadProfilePicture apiEndpoint='/users/me/profile-picture' acceptedMimeTypes={['image/jpeg', 'image/png', 'image/jpg']}></UploadProfilePicture>
        </div>
      </div>

      <div className={sharedStyles.card}>
        {
          (isLoadingUser || isFetchingUser) ? <LoadingIndicator /> : (
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} data-test='user-form'>
                <div className={styles.formContainer}>
                  <div className={styles.formColumn}>
                    <Input
                      attribute='email'
                      label="Email"
                      isRequired
                    />
                    <Input
                      attribute='firstName'
                      label="First Name"
                      isRequired
                    />
                    <Input
                      attribute='lastName'
                      label="Last Name"
                      isRequired
                    />
                  </div>
                  <div className={styles.formColumn}>
                    <Input
                      attribute='jobRole'
                      label="Job Role"
                    />
                    <Input
                      attribute='birthDate'
                      fieldType='date'
                      isRequired
                      label="Birth Date"
                    />
                    <Input
                      attribute='phoneNumber'
                      label="Phone"
                    />
                  </div>
                </div>
                <Button
                  variant='submit'
                  type='submit'
                >
                  {'Update'}
                </Button>
              </form>
            </FormProvider>
          )
        }
      </div>
    </div>
  )
}

export default Profile;