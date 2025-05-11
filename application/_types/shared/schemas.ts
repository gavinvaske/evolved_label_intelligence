import { Document, Types } from "mongoose";
import { SchemaTimestampsConfig } from "mongoose";

export interface IContact extends SchemaTimestampsConfig, Document {
  fullName: string;
  phoneNumber?: string;
  phoneExtension?: number;
  email?: string;
  contactStatus: string;
  notes?: string;
  position?: string;
  location?: Types.ObjectId;
}

export interface IShippingLocation extends IAddress {
  freightAccountNumber?: string;
  deliveryMethod?: Types.ObjectId;
}

export interface IAddress extends SchemaTimestampsConfig, Document {
  name: string;
  street: string;
  unitOrSuite?: string;
  city: string;
  state: string;
  zipCode: string;
}