import { IMaterialOrder } from '@shared/types/models.ts';
import { MaterialOrderModel } from '../../models/materialOrder.ts';
import { ChangeStreamDocument } from 'mongodb'
import { OperationTypes } from '../../constants/mongoDb.ts';

export function materialOrderWatcher(socket) {
  MaterialOrderModel.watch().on('change', async (change: ChangeStreamDocument<IMaterialOrder>) => {
    if (!('documentKey' in change) || !change.documentKey?._id) {
      return; // Ignore events that don't have an _id (Ex: drop, dropDatabase, rename, invalidate)
    }

    const mongooseObjectId = change.documentKey._id;
    const materialOrder = await MaterialOrderModel
      .findById(mongooseObjectId)
      .populate({ path: 'author' })
      .populate({ path: 'material' })
      .populate({ path: 'vendor' })
      .lean()
      .exec();

      if (OperationTypes.INSERT === change.operationType) {
        socket.emit('MATERIAL_ORDER:CREATED', materialOrder, change);
      } else if ([OperationTypes.REPLACE, OperationTypes.UPDATE].includes(change.operationType)) {
        socket.emit('MATERIAL_ORDER:UPDATED', materialOrder, change);
      } else if (OperationTypes.DELETE === change.operationType) {
        socket.emit('MATERIAL_ORDER:DELETED', mongooseObjectId, change);
      }
  
      socket.emit(mongooseObjectId, materialOrder, change);
  });
}