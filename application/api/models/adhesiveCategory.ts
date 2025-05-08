import { IAdhesiveCategory } from '@shared/types/models.ts';
import mongoose from 'mongoose';
mongoose.Schema.Types.String.set('trim', true);
const Schema = mongoose.Schema;
import mongooseDelete from 'mongoose-delete';
mongoose.plugin(mongooseDelete, { overrideMethods: true });

const schema = new Schema<IAdhesiveCategory>({
    name: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      index: true
    },
}, { timestamps: true, strict: 'throw' });

export const AdhesiveCategoryModel = mongoose.model<IAdhesiveCategory>('AdhesiveCategory', schema);