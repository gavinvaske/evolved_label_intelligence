import mongoose from 'mongoose';
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;
import { validatePhoneNumber, validateEmail } from '../services/dataValidationService.ts';
import { addressSchema } from '../schemas/address.ts';
import { IVendor } from '@shared/types/models.ts';

import mongooseDelete from 'mongoose-delete';
mongoose.plugin(mongooseDelete, { overrideMethods: true });

const schema = new Schema<IVendor>({
    name: {
        type: String,
        required: true,
        uppercase: true,
        unique: true
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



schema.index({ name: 'text', mfgSpecNumber: 'text' });

export const VendorModel = mongoose.model<IVendor>('Vendor', schema);