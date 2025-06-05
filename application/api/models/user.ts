import mongoose from 'mongoose';
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;
import { validatePhoneNumber, validateEmail } from '../services/dataValidationService.ts';
import { AVAILABLE_AUTH_ROLES } from '../enums/authRolesEnum.ts';
import { IUser } from '@shared/types/models.ts';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    index: true,
    unique: true,
    uppercase: true,
    required: true,
    validate: [validateEmail, 'must be a valid email'],
  },
  password: {
    type: String,
    minLength: 8,
    required: true
  },
  profilePicture: {
    data: {
      type: Buffer
    },
    contentType: {
      type: String,
      enum: ['image/png', 'image/jpeg', 'image/jpg']
    }
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  jobRole: {
    type: String
  },
  phoneNumber: {
    type: String,
    validate: [validatePhoneNumber, 'must be a valid phone number']
  },
  authRoles: {
    type: [{
      type: String,
      enum: AVAILABLE_AUTH_ROLES
    }],
  },
  lastLoginDateTime: {
    type: Date
  }
}, { timestamps: true, strict: 'throw' });

export const UserModel = mongoose.model<IUser>('User', userSchema);