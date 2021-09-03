import type express from "express";
import { ValidateError } from "@tsoa/runtime";
import { env, expressLogger } from "@/utils";
import { HTTPException } from "@/controllers/exceptions";
import { NodeEnv } from "@/utils/env";

interface ErrorJSON {
  title: string;
  details?: any;
  stackTrace?: string;
}

function filterErrorJSON(input: ErrorJSON): ErrorJSON {
  if (env.isNodeEnv(NodeEnv.PRODUCTION)) {
    return { title: input.title, details: input.details };
  }
  return input;
}

function debugErrorLog(value: any) {
  if (env.isNodeEnv(NodeEnv.DEVELOPMENT)) {
    console.error(value);
  }
}

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  debugErrorLog(err);
  if (err instanceof ValidateError) {
    expressLogger.warn(
      { error: err },
      `Caught Validation Error for ${req.path}:`
    );
    return res.status(400).json(
      filterErrorJSON({
        title: "Bad request. HTTP Parameter or Body validation failed",
        details: err.fields,
        stackTrace: err.stack,
      })
    );
  }
  if (err instanceof HTTPException) {
    expressLogger.warn({ error: err }, `HTTP Exception for ${req.path}:`);
    return res.status(err.statusCode).json(
      filterErrorJSON({
        title: err.name,
        details: err.message,
        stackTrace: err.stack,
      })
    );
  }
  if (err instanceof Error) {
    expressLogger.error({ error: err }, `Internal Error for ${req.path}:`);
    return res.status(500).json(
      filterErrorJSON({
        title: "Internal Server Error",
        details: err.message,
        stackTrace: err.stack,
      })
    );
  }
  return next();
};

export default errorHandler;
