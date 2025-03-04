import { IMaterial } from '@shared/types/models.ts';
import { MaterialModel } from '../../models/material.ts';
import { ChangeStreamDocument } from 'mongodb'
import { OperationTypes } from '../../constants/mongoDb.ts';

export function materialWatcher(socket) {
    MaterialModel.watch().on('change', async (change: ChangeStreamDocument<IMaterial>) => {
      if (!('documentKey' in change) || !change.documentKey?._id) {
        return; // Ignore events that don't have an _id (Ex: drop, dropDatabase, rename, invalidate)
    }

    const mongooseObjectId = change.documentKey._id;
    const material = await MaterialModel.findById(mongooseObjectId)
      .populate('vendor')
      .populate('materialCategory')
      .populate('adhesiveCategory')
      .populate('linerType')
      .lean()
      .exec();

    if (OperationTypes.INSERT === change.operationType) {
      socket.emit('MATERIAL:CREATED', material, change);
    } else if ([OperationTypes.REPLACE, OperationTypes.UPDATE].includes(change.operationType)) {
      socket.emit('MATERIAL:UPDATED', material, change);
    } else if (OperationTypes.DELETE === change.operationType) {
      socket.emit('MATERIAL:DELETED', mongooseObjectId, change);
    }

    socket.emit(mongooseObjectId, material, change);
    });
}