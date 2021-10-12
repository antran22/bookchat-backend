import {DocumentType, prop, Ref} from "@typegoose/typegoose";
import type {
  ArrayPropOptions,
  BasePropOptions,
  BeAnObject,
  MapPropOptions,
  PropOptionsForNumber,
  PropOptionsForString,
  VirtualOptions,
} from "@typegoose/typegoose/lib/types";
import {IObjectWithTypegooseFunction} from "@typegoose/typegoose/lib/types";
import mongoose from "mongoose";
import _ from "lodash";

type PropOptions =
  | BasePropOptions
  | ArrayPropOptions
  | MapPropOptions
  | PropOptionsForNumber
  | PropOptionsForString
  | VirtualOptions;

export const requiredProp = (options?: PropOptions) =>
  prop({ ...options, required: true });

export type TypegooseModel<T> = mongoose.Model<
  DocumentType<T, BeAnObject>,
  BeAnObject
>;

interface HaveID {
  _id: any;
}

export type TypegooseDocument<T extends HaveID> = mongoose.Document<
  T["_id"],
  BeAnObject
> &
  T &
  IObjectWithTypegooseFunction;

export function getReferenceIdString<T extends HaveID>(ref: Ref<T>): string {
  if (!ref) {
    return "";
  }
  if (_.isString(ref)) {
    return ref;
  }
  // @ts-ignore
  return ref._id.toString();
}

export function getLastID<T extends HaveID>(values?: T[]): string | null {
  if (!values || values.length === 0) {
    return null;
  }

  return values[values.length - 1]._id.toString();
}
