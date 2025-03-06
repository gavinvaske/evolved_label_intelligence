import axios, { AxiosResponse } from 'axios';
import { IUser } from '@shared/types/models.ts';

export const getUsers = async (): Promise<IUser[]> => {
  const response : AxiosResponse = await axios.get('/users');
  const users: IUser[] = response.data;

  return users
}

export const getLoggedInUserProfilePictureUrl = async (): Promise<any> => {
  const response : AxiosResponse = await axios.get('/users/me/profile-picture');
  const profilePictureUrl: any = response.data;

  return profilePictureUrl;
}