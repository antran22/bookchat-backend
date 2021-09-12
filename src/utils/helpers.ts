import _ from "lodash";

export function clamp(num: number, min: number, max: number): number {
  if (min > max) {
    const t = min;
    min = max;
    max = t;
  }
  return Math.max(min, Math.min(max, num));
}
export function parseBoolean(str?: string | null): boolean | null {
  if (!str) {
    return null;
  }
  switch (str.toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return null;
  }
}

export function isStringArray(arr: any): arr is string[] {
  if (!(arr instanceof Array)) {
    return false;
  }
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "string") {
      return false;
    }
  }
  return true;
}

export function notNil<T>(
  val: T | null | undefined
): val is Exclude<typeof val, null | undefined> {
  return !_.isNil(val);
}

export function pickAndOmitNil<T extends object>(
  obj: T,
  ...keys: Array<keyof T>
): T {
  return _(obj).pick(keys).omitBy(_.isNil).value() as T;
}

export function isNonEmptyArray<T>(val: any): val is Array<T> {
  return val instanceof Array && val.length > 0;
}

export function padWithSlash(path: string | null): string | null {
  if (notNil(path)) {
    return "/" + path;
  }
  return null;
}

export type ClassInterface<C> = {
  [K in keyof C]: C[K];
};

export type Optional<T> = {
  [P in keyof T]?: T[P];
};
