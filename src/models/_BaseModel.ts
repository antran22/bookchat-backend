import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Document, Types } from "mongoose";
import { isDocument, Ref } from "@typegoose/typegoose";
import { TypegooseModel } from "@/utils";

interface Constructor<T> {
  new (...args: any): any;
}

export interface ListOptions {
  limit: number;
  cursor?: string;
}

type UnwrapPromise<T> = T extends PromiseLike<infer U> ? U : T;

export interface DatabaseModel extends Document {}

export abstract class DatabaseModel extends TimeStamps {
  /** @ignore */
  _id!: Types.ObjectId;
  __v!: number;

  /**
   * This method is used when returning objects to the API output.
   * You can call toJSON first in the implementation of this method to get a LeanDocument object,
   * then return the appropriate fields.
   * Or call populateFields to control which fields to populate, then jsonify those reference field manually
   */
  abstract jsonify(...args: any[]): Promise<any>;

  async populateFields(populateFields?: (keyof this)[]): Promise<void> {
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

  static listByCursor<T extends DatabaseModel>(
    this: TypegooseModel<T>,
    options: ListOptions
  ) {
    let query = this.find().limit(options.limit);
    if (options.cursor) {
      query = query.where({
        _id: {
          $gt: new Types.ObjectId(options.cursor),
        },
      });
    }

    return query;
  }
}
