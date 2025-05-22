import { IAdhesiveCategory } from '@shared/types/models.ts';
import mongoose from 'mongoose';
import MongooseDelete, { SoftDeleteModel } from 'mongoose-delete';

/* Trim all strings and enable soft deletes */
mongoose.Schema.Types.String.set('trim', true);
mongoose.plugin(MongooseDelete, { overrideMethods: true, deletedBy: true, deletedAt: true });

const Schema = mongoose.Schema;

const schema = new Schema<IAdhesiveCategory>({
    name: {
      type: String,
      required: true,
      uppercase: true,
    },
}, { timestamps: true, strict: 'throw' });

schema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $eq: false } }
  }
);

export const AdhesiveCategoryModel = mongoose.model<IAdhesiveCategory, SoftDeleteModel<IAdhesiveCategory>>('AdhesiveCategory', schema);