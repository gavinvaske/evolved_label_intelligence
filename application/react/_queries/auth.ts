import { IUser } from '@shared/types/models';
import axios, { AxiosResponse } from 'axios';

export const getLoggedInUser = async (): Promise<IUser> => {
  const response : AxiosResponse = await axios.get('/auth/me');
  const user: IUser = response.data;

  return user
}