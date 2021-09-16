import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";

type ToJSONFunction = <M extends DatabaseModel>(this: M) => M;
interface Constructor<T> {
  new (...args: any): T;
}

type UnwrapPromise<T> = T extends PromiseLike<infer U> ? U : T;

export abstract class DatabaseModel extends TimeStamps {
  /** @ignore */
  _id!: Types.ObjectId;
  __v!: number;

  /** @ignore */
  toJSON!: ToJSONFunction;

  /**
   * Sanitise the mongoose Document, remove secret fields for being returned by the API.
   */
  abstract jsonify(...args: any[]): Promise<any>;

  static async jsonifyAll<T extends DatabaseModel>(
    this: Constructor<T>,
    values: T[],
    ...args: Parameters<T["jsonify"]>
  ): Promise<UnwrapPromise<ReturnType<T["jsonify"]>>[]> {
    const promises = values.map(
      (value) => value.jsonify(args) as UnwrapPromise<ReturnType<T["jsonify"]>>
    );
    return Promise.all(promises);
  }
}
