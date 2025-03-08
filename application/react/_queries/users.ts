import axios, { AxiosResponse } from 'axios';
import { IUser } from '@shared/types/models.ts';

export const getUsers = async (): Promise<IUser[]> => {
  const response : AxiosResponse = await axios.get('/users');
  const users: IUser[] = response.data;

  return users
}

