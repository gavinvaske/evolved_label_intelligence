import axios, { AxiosResponse } from 'axios';
import { DeliveryMethod } from '../_types/databasemodels/deliveryMethod.ts';
import { MongooseId } from "@shared/types/typeAliases.ts";

export const getDeliveryMethods = async (): Promise<DeliveryMethod[]> => {
  const response : AxiosResponse = await axios.get('/delivery-methods');
  const deliveryMethods: DeliveryMethod[] = response.data;

  return deliveryMethods
}

export const getOneDeliveryMethod = async (mongooseId: MongooseId): Promise<DeliveryMethod> => {
  const response : AxiosResponse = await axios.get(`/delivery-methods/${mongooseId}`);
  const deliveryMethod: DeliveryMethod = response.data;

  return deliveryMethod
}