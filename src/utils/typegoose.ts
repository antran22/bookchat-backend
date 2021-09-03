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

interface ObjId {
  toString(): string;
  equals(otherId: string | ObjId): boolean;
}

type ToJSONFunction = <M extends DatabaseModel>(this: M) => M;

export abstract class DatabaseModel extends TimeStamps {
  /** @ignore */
  _id!: ObjId;
  __v!: number;

  /** @ignore */
  toJSON!: ToJSONFunction;

  abstract sanitise(): unknown;
}
