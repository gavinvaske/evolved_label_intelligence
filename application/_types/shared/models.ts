import { Document } from "mongoose";
import { SchemaTimestampsConfig } from "mongoose";
import { IAddress, IContact, IShippingLocation } from "./schemas.ts";
import { MongooseId } from "./typeAliases.ts";
import { AVAILABLE_AUTH_ROLES } from "../../api/enums/authRolesEnum.ts";

export interface IDeliveryMethod extends SchemaTimestampsConfig, Document<MongooseId> {
  name: string;
}

export interface IMaterialCategory extends SchemaTimestampsConfig, Document<MongooseId> {
  name: string;
}

export interface IAdhesiveCategory extends SchemaTimestampsConfig, Document<MongooseId> {
  name: string;
}

export interface ILinerType extends SchemaTimestampsConfig, Document<MongooseId> {
  name: string;
}

export interface ICreditTerm extends SchemaTimestampsConfig, Document<MongooseId> {
  description: string;
}

export interface ICustomer extends SchemaTimestampsConfig, Document<MongooseId> {
  customerId: string;
  name: string;
  notes?: string;
  businessLocations?: IAddress[];
  shippingLocations?: IShippingLocation[];
  billingLocations?: IAddress[];
  contacts?: IContact[];
  creditTerms?: MongooseId[] | ICreditTerm[];
  overun: number;
}

export interface IVendor extends SchemaTimestampsConfig, Document<MongooseId>  {
  name: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  website?: string;
  primaryAddress: IAddress;
  remittanceAddress: IAddress;
  primaryContactName: string;
  primaryContactPhoneNumber: string;
  primaryContactEmail: string;
  mfgSpecNumber?: string;
}

export interface IMaterialLengthAdjustment extends SchemaTimestampsConfig, Document<MongooseId>  {
  material: MongooseId | IMaterial;
  length: number;
  notes?: string;
}

export interface IMaterial extends SchemaTimestampsConfig, Document<MongooseId> {
  name: string;
  materialId: string;
  vendor: MongooseId | IVendor;
  materialCategory: MongooseId | IMaterialCategory;
  weight: number;
  costPerMsi: number;
  freightCostPerMsi: number;
  width: number;
  faceColor: string;
  adhesive: string;
  thickness: number;
  adhesiveCategory: MongooseId | IAdhesiveCategory;
  quotePricePerMsi: number;
  description: string;
  whenToUse: string;
  alternativeStock?: string;
  length: number;
  facesheetWeightPerMsi: number;
  adhesiveWeightPerMsi: number;
  linerWeightPerMsi: number;
  locations: string[];
  linerType: MongooseId | ILinerType;
  productNumber: string;
  masterRollSize: number;
  image: string;
  lowStockThreshold: number;
  lowStockBuffer: number;
  inventory: {
    netLengthAvailable: number,
    lengthArrived: number,
    lengthNotArrived: number,
    materialOrders: MongooseId[] | IMaterialOrder[],
    sumOfLengthAdjustments: number,
    lengthAdjustments: MongooseId[] | IMaterialLengthAdjustment
  };
  netLength: number;
}

export interface IDie extends SchemaTimestampsConfig, Document<MongooseId> {
  dieNumber: string,
  shape: string,
  sizeAcross: number,
  sizeAround: number,
  numberAcross: number,
  numberAround: number,
  gear: number,
  toolType: string,
  notes: string,
  cost: number,
  vendor: string,
  magCylinder: number,
  cornerRadius: number,
  topAndBottom: number,
  leftAndRight: number,
  spaceAcross: number,
  spaceAround: number,
  facestock: string,
  liner: string,
  specialType?: string,
  serialNumber: string,
  status: string,
  quantity: number,
  orderDate?: Date | string,
  arrivalDate?: Date | string
  isLamination?: boolean
}

export interface IMaterialOrder extends SchemaTimestampsConfig, Document<MongooseId> {
  author: MongooseId | IUser;
  material: MongooseId | IMaterial;
  purchaseOrderNumber: string;
  orderDate: Date | string;
  arrivalDate: Date | string;
  feetPerRoll: number;
  totalRolls: number;
  totalCost: number;
  vendor: MongooseId | IVendor;
  hasArrived?: boolean;
  notes?: string;
  freightCharge: number;
  fuelCharge: number;
}

export interface IUser extends SchemaTimestampsConfig, Document<MongooseId> {
  email: string;
  password: string;
  profilePicture: {
    data: Buffer;
    contentType: string;
  };
  firstName: string;
  lastName: string;
  birthDate: Date | string;
  jobRole: string;
  phoneNumber: string;
  authRoles: (typeof AVAILABLE_AUTH_ROLES)[number][];
  lastLoginDateTime: Date | string;
}

