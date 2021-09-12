import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";

type ToJSONFunction = <M extends DatabaseModel>(this: M) => M;

export abstract class DatabaseModel extends TimeStamps {
  /** @ignore */
  _id!: Types.ObjectId;
  __v!: number;

  /** @ignore */
  toJSON!: ToJSONFunction;

  /**
   * Sanitise the mongoose Document, remove secret fields for being returned by the API.
   */
  abstract sanitise(): Pick<this, any>;
}
