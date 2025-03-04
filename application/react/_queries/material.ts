import { IMaterial } from "@shared/types/models";
import axios, { AxiosResponse } from "axios";

export const getMaterials = async () : Promise<IMaterial[]> => {
  const response : AxiosResponse = await axios.get(`/materials`);
  const materials: IMaterial[] = response.data;

  return materials;
}
