import {DocumentType, prop} from "@typegoose/typegoose";
import type {
  ArrayPropOptions,
  BasePropOptions,
  BeAnObject,
  MapPropOptions,
  PropOptionsForNumber,
  PropOptionsForString,
  VirtualOptions,
} from "@typegoose/typegoose/lib/types";
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

export type MongooseModel<T> = mongoose.Model<
  DocumentType<T, BeAnObject>,
  BeAnObject
>;
