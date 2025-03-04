import { SortOption } from "../../_types/shared/mongoose.ts";

export const DEFAULT_SORT_OPTIONS: SortOption = { updatedAt: -1 }

export const enum MongooseHooks {
  FindOneAndReplace = "findOneAndReplace",
  UpdateOne = "updateOne",
  FindOneAndUpdate = "findOneAndUpdate",
  UpdateMany = "updateMany",
  DeleteOne = "deleteOne",
  DeleteMany = "deleteMany",
  Save = "save",
  InsertMany = "insertMany",
  BulkWrite = "bulkWrite",
  FindOneAndDelete = "findOneAndDelete",
  ReplaceOne = 'replaceOne',
}

export const updateOneHooks: Array<MongooseHooks.UpdateOne | MongooseHooks.FindOneAndUpdate> = [
  MongooseHooks.UpdateOne, 
  MongooseHooks.FindOneAndUpdate
]

export const updateManyHooks: Array<MongooseHooks.UpdateMany> = [
  MongooseHooks.UpdateMany
]

export const replaceOneHooks: Array<MongooseHooks.ReplaceOne | MongooseHooks.FindOneAndReplace> = [
  MongooseHooks.ReplaceOne,
  MongooseHooks.FindOneAndReplace
]

export const deleteOneHooks: Array<MongooseHooks.DeleteOne | MongooseHooks.FindOneAndDelete> = [
  MongooseHooks.DeleteOne, MongooseHooks.FindOneAndDelete
]

export const deleteManyHooks: Array<MongooseHooks.DeleteMany> = [
  MongooseHooks.DeleteMany
]

export const saveOneHooks: Array<MongooseHooks.Save> = [
  MongooseHooks.Save
]

export const createAndUpdateOneHooks = [
  ...saveOneHooks,
  ...updateOneHooks,
  ...replaceOneHooks
]