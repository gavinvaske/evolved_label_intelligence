import { useEffect } from 'react';
import './Profile.scss';
import { useQueryClient } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useForm } from 'react-hook-form';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { Input } from '../../_global/FormInputs/Input/Input';
import { UploadProfilePicture } from '../../UploadProfilePicture/UploadProfilePicture';
import { refreshLoggedInUser, useLoggedInUser } from '../../_hooks/useLoggedInUser';
import { convertDateStringToFormInputDateString } from '../../_helperFunctions/dateTime';
import { IUserForm } from '@ui/types/forms';
import { LoadingIndicator } from '../../_global/LoadingIndicator/LoadingIndicator';

export const Profile = () => {
  const queryClient = useQueryClient()
  const { user: loggedInUser, isLoading: isLoadingUser, isFetching: isFetchingUser, error } = useLoggedInUser();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<IUserForm>();

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

  const hourOfDay = new Date().getHours();
  const timeBasedGreetingMessage = hourOfDay < 12 ? 'Good Morning' : hourOfDay < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div id='profile-page'>
      <div className='profile-header-container'>
        <div className='profile-canvas-background'></div>
        <div className='profile-details-footer'>
          <UploadProfilePicture apiEndpoint='/users/me/profile-picture' acceptedMimeTypes={['image/jpeg', 'image/png', 'image/jpg']}></UploadProfilePicture>
          {timeBasedGreetingMessage}
        </div>
      </div>

      <div className='card'>
        {
          (isLoadingUser || isFetchingUser) ? <LoadingIndicator /> : (
            <form onSubmit={handleSubmit(onSubmit)} data-test='user-form'>
              <Input
                attribute='email'
                label="Email"
                isRequired
                register={register}
                errors={errors}
              />
              <Input
                attribute='firstName'
                label="First Name"
                isRequired
                register={register}
                errors={errors}
              />
              <Input
                attribute='lastName'
                label="Last Name"
                isRequired
                register={register}
                errors={errors}
              />
              <Input
                attribute='jobRole'
                label="Job Role"
                register={register}
                errors={errors}
              />
              <Input
                attribute='birthDate'
                fieldType='date'
                isRequired
                label="Birth Date"
                register={register}
                errors={errors}
              />
              <Input
                attribute='phoneNumber'
                label="Phone"
                register={register}
                errors={errors}
              />
              <button className='create-entry submit-button' type='submit'>{'Update'}</button>
            </form>
          )}
      </div>


    </div>
  )
}