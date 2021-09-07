import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";

type ToJSONFunction = <M extends DatabaseModel>(this: M) => M;

export abstract class DatabaseModel extends TimeStamps {
  /** @ignore */
  _id!: Types.ObjectId;
  __v!: number;

  /** @ignore */
  toJSON!: ToJSONFunction;

  abstract sanitise(): Pick<this, any>;
}
