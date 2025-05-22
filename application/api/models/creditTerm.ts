import { ICreditTerm } from '@shared/types/models.ts';
import mongoose, { Schema } from 'mongoose';
import MongooseDelete, { SoftDeleteModel } from 'mongoose-delete';

/* Trim all strings and enable soft deletes */
mongoose.Schema.Types.String.set('trim', true);
mongoose.plugin(MongooseDelete, { overrideMethods: true, deletedBy: true, deletedAt: true });

const schema = new Schema<ICreditTerm>({
    description: {
        type: String,
        required: true,
        uppercase: true
    },
}, { timestamps: true, strict: 'throw' });

/* Unique index */
schema.index(
  { description: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $eq: false } }
  }
);

export const CreditTermModel = mongoose.model<ICreditTerm, SoftDeleteModel<ICreditTerm>>('CreditTerm', schema);
