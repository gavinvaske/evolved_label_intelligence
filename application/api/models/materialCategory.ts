import { IMaterialCategory } from '@shared/types/models.ts';
import mongoose, { Schema } from 'mongoose';
import MongooseDelete, { SoftDeleteModel } from 'mongoose-delete';

/* Trim all strings and enable soft deletes */
mongoose.Schema.Types.String.set('trim', true);
mongoose.plugin(MongooseDelete, { overrideMethods: true, deletedBy: true, deletedAt: true });

const schema = new Schema<IMaterialCategory>({
    name: {
        type: String,
        required: true,
        uppercase: true
    }
}, { timestamps: true, strict: 'throw' });

schema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $eq: false } }
  }
);

export const MaterialCategoryModel = mongoose.model<IMaterialCategory, SoftDeleteModel<IMaterialCategory>>('MaterialCategory', schema);
