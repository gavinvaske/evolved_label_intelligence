import { Types } from "mongoose";

export type MongooseId = MongooseIdStr | Types.ObjectId;
export type MongooseIdStr = string;
