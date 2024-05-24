const MaterialOrder = require('../../models/materialOrder');

module.exports.materialOrderWatcher = (socket) => {
  MaterialOrder.watch().on('change', async (change) => {
    console.log('MateriOrder changed:', change)
    const mongooseObjectId = change.documentKey._id;

    const materialOrder = await MaterialOrder
      .findById(mongooseObjectId)
      .populate({path: 'author'})
      .populate({path: 'material'})
      .populate({path: 'vendor'})
      .lean()
      .exec();

    socket.emit(mongooseObjectId, materialOrder, change);
  });
}