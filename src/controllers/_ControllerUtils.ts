import { env, HaveID } from "@/utils";
import express from "express";

export interface Listing<T> {
  data: T[];
  nextUrl?: string;
}

export interface DeleteResult<T> {
  deleted: T;
  message?: string;
}

function getLastID<T extends HaveID>(values?: T[]): string | null {
  if (!values || values.length === 0) {
    return null;
  }

  return values[values.length - 1]._id.toString();
}

export function wrapListingResult<T extends HaveID>(
  result: T[],
  request: express.Request
): Listing<T> {
  const lastId = getLastID(result);

  const nextUrl = lastId
    ? env.resolveAPIPath(request.path, { ...request.query, cursor: lastId })
    : undefined;

  return {
    data: result,
    nextUrl,
  };
}
