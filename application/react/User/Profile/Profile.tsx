import React, { useEffect } from 'react';
import './Profile.scss';
import { getLoggedInUser } from '../../_queries/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { FieldValues, useForm } from 'react-hook-form';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../_hooks/useSuccessMessage';
import { Input } from '../../_global/FormInputs/Input/Input';
import { UploadProfilePicture } from '../../UploadProfilePicture/UploadProfilePicture';
import { refreshLoggedInUser } from '../../_hooks/useLoggedInUser';

export const Profile = () => {
  const queryClient = useQueryClient()
  const { isError, data: loggedInUser, error } = useQuery({
    queryKey: ['get-me'],
    queryFn: getLoggedInUser
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FieldValues>();

  useEffect(() => {
    reset({
      email: loggedInUser?.email,
      firstName: loggedInUser?.firstName,
      lastName: loggedInUser?.lastName,
      birthDate: loggedInUser?.birthDate || '',
      phoneNumber: loggedInUser?.phoneNumber,
      jobRole: loggedInUser?.jobRole
    })
  }, [loggedInUser, reset])

  if (isError) {
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
          { timeBasedGreetingMessage }
        </div>
      </div>


      <div className='card'>
        <form onSubmit={handleSubmit(onSubmit)} data-test='user-form'>
          <Input
            attribute='email'
            label="Email"
            register={register}
            errors={errors}
          />
          <Input
            attribute='firstName'
            label="First Name"
            register={register}
            errors={errors}
          />
          <Input
            attribute='lastName'
            label="Last Name"
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
      </div>
    </div>
  )
}