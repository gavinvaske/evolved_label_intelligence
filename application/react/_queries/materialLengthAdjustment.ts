import { IMaterialLengthAdjustment } from "@shared/types/models";
import { MongooseIdStr } from "@shared/types/typeAliases";
import axios, { AxiosResponse } from "axios";

export const getMaterialLengthAdjustmentsByIds = async (mongooseIds: MongooseIdStr[]): Promise<IMaterialLengthAdjustment[]> => {
  const response : AxiosResponse = await axios.post(`/material-length-adjustments/batch`, { ids: mongooseIds });
  const materialLengthAdjustments: IMaterialLengthAdjustment[] = response.data;

  return materialLengthAdjustments
}