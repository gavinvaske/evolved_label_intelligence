import axios, { AxiosResponse } from 'axios';
import { MongooseId } from "@shared/types/typeAliases.ts";
import { IDeliveryMethod } from '@shared/types/models.ts';

export const getDeliveryMethods = async (): Promise<IDeliveryMethod[]> => {
  const response : AxiosResponse = await axios.get('/delivery-methods');
  const deliveryMethods: IDeliveryMethod[] = response.data;

  return deliveryMethods
}

export const getOneDeliveryMethod = async (mongooseId: MongooseId): Promise<IDeliveryMethod> => {
  const response : AxiosResponse = await axios.get(`/delivery-methods/${mongooseId}`);
  const deliveryMethod: IDeliveryMethod = response.data;

  return deliveryMethod
}