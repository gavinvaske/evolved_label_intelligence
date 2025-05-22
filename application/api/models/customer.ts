import mongoose, { Schema } from 'mongoose';
import { ICustomer } from '@shared/types/models.ts';
import { addressSchema } from '../schemas/address.ts';
import { contactSchema } from '../schemas/contact.ts';
import MongooseDelete, { SoftDeleteModel } from 'mongoose-delete';

/* Trim all strings and enable soft deletes */
mongoose.Schema.Types.String.set('trim', true);
mongoose.plugin(MongooseDelete, { overrideMethods: true, deletedBy: true, deletedAt: true });

function doesArrayContainElements(value) {
  return value.length > 0;
}

// ShippingLocations inherit the attributes from the address schema and add additional properties.
// To learn more, read about "discriminators" here: https://mongoosejs.com/docs/discriminators.html
const shippingLocationsSchema = new mongoose.Schema({
  ...addressSchema.obj,
  freightAccountNumber: {
    type: String,
    uppercase: true
  },
  deliveryMethod: {
    type: Schema.Types.ObjectId,
    ref: 'DeliveryMethod'
  }
}, { timestamps: true, strict: 'throw' });

const schema = new Schema<ICustomer>({
  customerId: {
    type: String,
    required: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
  },
  notes: {
    type: String
  },
  businessLocations: {
    type: [addressSchema]
  },
  shippingLocations: {
    type: [shippingLocationsSchema]
  },
  billingLocations: {
    type: [addressSchema]
  },
  contacts: {
    type: [contactSchema],
    validate: [doesArrayContainElements, 'Must have at least one contact']
  },
  creditTerms: {
    type: [Schema.Types.ObjectId],
    ref: 'CreditTerm'
  },
  overun: {
    type: Number,
    required: true
  }
}, { timestamps: true, strict: 'throw' });

/* Unique index */
schema.index(
  { customerId: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $eq: false } }
  }
)

export const CustomerModel = mongoose.model<ICustomer, SoftDeleteModel<ICustomer>>('Customer', schema);
