import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
import { TypegooseDocument } from "@/utils";
import { isDocument, Ref } from "@typegoose/typegoose";

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

  async populateFields<T extends DatabaseModel>(
    this: TypegooseDocument<T>,
    populateFields?: (keyof T)[]
  ): Promise<void> {
    if (populateFields) {
      await this.populate(populateFields.join(" ")).execPopulate();
    }
  }

  static async jsonifyReferenceField<T extends DatabaseModel>(
    this: Constructor<T>,
    ref: Ref<T>
  ): Promise<UnwrapPromise<ReturnType<T["jsonify"]>> | undefined> {
    if (isDocument(ref)) {
      return ref.jsonify();
    }
    return undefined;
  }

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
