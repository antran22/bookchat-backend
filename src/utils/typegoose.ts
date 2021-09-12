import { DocumentType, prop } from "@typegoose/typegoose";
import type {
  ArrayPropOptions,
  BasePropOptions,
  BeAnObject,
  MapPropOptions,
  PropOptionsForNumber,
  PropOptionsForString,
  VirtualOptions,
} from "@typegoose/typegoose/lib/types";
import { IObjectWithTypegooseFunction } from "@typegoose/typegoose/lib/types";
import mongoose from "mongoose";

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

export type TypegooseDocument<T extends { _id: any }> = mongoose.Document<
  T["_id"],
  BeAnObject
> &
  T &
  IObjectWithTypegooseFunction;
