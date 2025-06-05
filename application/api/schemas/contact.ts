import mongoose from 'mongoose';
import { IContact } from '@shared/types/schemas.ts';
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;
import { validatePhoneNumber, validateEmail } from '../services/dataValidationService.ts';

export const contactSchema = new Schema<IContact>({
    fullName: {
        type: String,
        uppercase: true,
        required: true,
    },
    phoneNumber: {
        type: String,
        validate: [validatePhoneNumber, 'must be a valid phone number']
    },
    phoneExtension: {
        type: Number
    },
    email: {
        type: String,
        uppercase: true,
        validate: [validateEmail, 'must be a valid email']
    },
    contactStatus: {
        type: String,
        uppercase: true,
        required: true
    },
    notes: {
        type: String
    },
    position: {
        type: String
    },
    location: { // One of businessLocations, shippingLocations, or billingLocations
        type: mongoose.Schema.Types.ObjectId
    },
}, { timestamps: true });
