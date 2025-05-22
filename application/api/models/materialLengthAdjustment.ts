import { IMaterialLengthAdjustment } from '@shared/types/models.ts';
import mongoose, { Schema } from 'mongoose';
import { createAndUpdateOneHooks, deleteManyHooks, deleteOneHooks, MongooseHooks, updateManyHooks } from '../constants/mongoose.ts';
import { populateMaterialInventories } from '../services/materialInventoryService.ts';
import MongooseDelete, { SoftDeleteModel } from 'mongoose-delete';

/* Trim all strings and enable soft deletes */
mongoose.Schema.Types.String.set('trim', true);
mongoose.plugin(MongooseDelete, { overrideMethods: true, deletedBy: true, deletedAt: true });

/* 
  * This table is responsible for Adding or Subtracting material from Inventory.
  * This primary will be used by an Admin to reconcile sporatic changes to the inventory.
  * Other methods for adding or subtracting materials are the "Ticket" and "MaterialOrder" db tables.
*/
const schema = new Schema<IMaterialLengthAdjustment>({
    material: {
        type: Schema.Types.ObjectId,
        ref: 'Material',
        required: true
    },
    length: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        required: false
    }
}, { timestamps: true, strict: 'throw' });


/* Hooks */
schema.post([...createAndUpdateOneHooks, ...updateManyHooks], (result: IMaterialLengthAdjustment | IMaterialLengthAdjustment[]) => {
  if (result instanceof Array) {
    const materialIds = result.map(({material}) => material && material.toString());
    populateMaterialInventories(materialIds);
  } else {
    populateMaterialInventories([result.material && result.material.toString()]);
  }
})

schema.post(MongooseHooks.InsertMany, (docs: IMaterialLengthAdjustment[]) => (populateMaterialInventories(docs.map(({material}) => material && material.toString()))))

schema.post(MongooseHooks.BulkWrite, () => populateMaterialInventories())

schema.post([...deleteOneHooks, ...deleteManyHooks], (_) => populateMaterialInventories())


/* Model */
export const MaterialLengthAdjustmentModel = mongoose.model<IMaterialLengthAdjustment, SoftDeleteModel<IMaterialLengthAdjustment>>('MaterialLengthAdjustment', schema);

