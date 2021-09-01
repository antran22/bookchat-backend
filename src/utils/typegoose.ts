import { prop } from "@typegoose/typegoose";
import type {
  ArrayPropOptions,
  BasePropOptions,
  MapPropOptions,
  PropOptionsForNumber,
  PropOptionsForString,
  VirtualOptions,
} from "@typegoose/typegoose/lib/types";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

type PropOptions =
  | BasePropOptions
  | ArrayPropOptions
  | MapPropOptions
  | PropOptionsForNumber
  | PropOptionsForString
  | VirtualOptions;

export const requiredProp = (options?: PropOptions) =>
  prop({ ...options, required: true });

export abstract class DatabaseModel extends TimeStamps {}
