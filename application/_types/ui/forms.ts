import { MongooseId } from "../shared/typeAliases";

/* An _id can be passed in to override the default/generated mongoose id (hint: see generateMongooseId()) */
type OptionalMongooseId = {
  _id?: string;
}

export type IAddressForm = {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  unitOrSuite?: string;
} & OptionalMongooseId;

export type IVendorForm = {
  name: string;
  phoneNumber?: string | undefined;
  email?: string | undefined;
  notes?: string | undefined;
  website?: string | undefined;
  primaryAddress: IAddressForm;
  remittanceAddress: IAddressForm | null;
  primaryContactName: string;
  primaryContactPhoneNumber: string;
  primaryContactEmail: string;
  mfgSpecNumber?: string | undefined;
} & OptionalMongooseId;

export type IDieForm = {
  dieNumber: string;
  shape: string;
  sizeAcross: number;
  sizeAround: number;
  numberAcross: number;
  numberAround: number;
  gear: number;
  toolType: string;
  notes: string;
  cost: number;
  vendor: string;
  magCylinder: number;
  cornerRadius: number;
  topAndBottom: number;
  leftAndRight: number;
  facestock: string;
  liner: string;
  specialType?: string;
  serialNumber: string;
  status: string;
  quantity: number;
  isLamination: boolean | undefined;
} & OptionalMongooseId;

export type ICustomerForm = {
  customerId: string;
  name: string;
  businessLocations?: IAddressForm[];
  shippingLocations?: IShippingLocationForm[];
  billingLocations?: IAddressForm[];
  contacts?: IContactForm[];
  overun: string;
  notes?: string;
  creditTerms?: MongooseId[];
} & OptionalMongooseId;

export type IShippingLocationForm = IAddressForm & {
  freightAccountNumber?: string;
  deliveryMethod?: MongooseId;
} & OptionalMongooseId;

export type IContactForm = {
  fullName: string;
  phoneNumber?: string;
  phoneExtension?: string;
  email?: string;
  contactStatus: string;
  notes?: string;
  position?: string;
  location?: IAddressForm;
} & OptionalMongooseId;

export type IMaterialLengthAdjustmentForm = {
  material: MongooseId;
  length: number;
  notes?: string;
} & OptionalMongooseId;

export type IMaterialForm = {
  name: string;
  materialId: string;
  vendor: MongooseId;
  materialCategory: MongooseId;
  thickness: number;
  weight: number;
  costPerMsi: number;
  freightCostPerMsi: number;
  width: number;
  faceColor: string;
  adhesive: string;
  adhesiveCategory: MongooseId;
  quotePricePerMsi: number;
  description: string;
  whenToUse: string;
  alternativeStock?: string;
  length: number;
  facesheetWeightPerMsi: number;
  adhesiveWeightPerMsi: number;
  linerWeightPerMsi: number;
  locations?: string[] | undefined;
  locationsAsStr?: string;
  linerType: MongooseId;
  productNumber: string;
  masterRollSize: number;
  image: string;
  lowStockThreshold: number;
  lowStockBuffer: number;
} & OptionalMongooseId;

export type IMaterialOrderForm = {
  author: MongooseId;
  material: MongooseId;
  vendor: MongooseId;
  purchaseOrderNumber: string;
  orderDate: string;
  feetPerRoll: number;
  totalRolls: number;
  totalCost: number;
  hasArrived?: boolean;
  notes?: string;
  arrivalDate: string;
  freightCharge: number;
  fuelCharge: number;
} & OptionalMongooseId;

export type ICreditTermForm = {
  description: string;
} & OptionalMongooseId;

export type ILinerTypeForm = {
  name: string;
} & OptionalMongooseId;

export type IAdhesiveCategoryForm = {
  name: string;
} & OptionalMongooseId;

export type IMaterialCategoryForm = {
  name: string;
} & OptionalMongooseId;

export type IProductForm = {
  productDescription: string;
  unwindDirection: number;
  ovOrEpm: string;
  artNotes: string;
  pressNotes: string;
  finishType: string;
  coreDiameter: number;
  labelsPerRoll: number;
  dieCuttingNotes: string;
  overun: number;
  spotPlate: boolean;
  numberOfColors: number;
  die: MongooseId;
  primaryMaterial: MongooseId;
  secondaryMaterial: MongooseId;
  finish: MongooseId;
  customer: MongooseId;
} & OptionalMongooseId;

export type IDeliveryMethodForm = {
  name: string;
} & OptionalMongooseId;

export type IUserForm = {
  email: string;
  firstName: string;
  lastName: string;
  jobRole?: string;
  birthDate: string;
  phoneNumber?: string;
} & OptionalMongooseId;

