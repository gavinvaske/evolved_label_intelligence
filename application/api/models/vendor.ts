import mongoose, { Schema } from 'mongoose';
import mongooseDelete, { SoftDeleteModel } from 'mongoose-delete';
import { validatePhoneNumber, validateEmail } from '../services/dataValidationService.ts';
import { addressSchema } from '../schemas/address.ts';
import { IVendor } from '@shared/types/models.ts';

/* Trim all strings and enable soft deletes */
mongoose.Schema.Types.String.set('trim', true);
mongoose.plugin(mongooseDelete, { overrideMethods: true, deletedBy: true, deletedAt: true });

const schema = new Schema<IVendor>({
    name: {
        type: String,
        required: true,
        uppercase: true
    },
    phoneNumber: {
        type: String,
        validate: [validatePhoneNumber, 'The provided phone number "{VALUE}" is not a valid phone number']
    },
    email: {
        type: String,
        required: false,
        validate: [validateEmail, 'The provided email "{VALUE}" is not a valid email address']
    },
    notes: {
        type: String,
        required: false
    },
    website: {
        type: String,
        required: false
    },
    primaryAddress: {
        type: addressSchema,
        required: true
    },
    remittanceAddress: {
      type: addressSchema,
      required: false
  },
    primaryContactName: {
        type: String,
        required: true
    },
    primaryContactPhoneNumber: {
        type: String,
        required: true,
        validate: [validatePhoneNumber, 'Invalid attribute "primaryContactPhoneNumber": The provided phone number "{VALUE}" is not a valid phone number']
    },
    primaryContactEmail: {
        type: String,
        required: true,
        validate: [validateEmail, 'Invalid attribute "primaryContactEmail": The provided email "{VALUE}" is not a valid email address']
    },
    mfgSpecNumber: {
        type: String,
        required: false
    }
}, { timestamps: true, strict: 'throw' });

/* Unique Index */
schema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $eq: false } }
  }
);

export const VendorModel = mongoose.model<IVendor, SoftDeleteModel<IVendor>>('Vendor', schema);