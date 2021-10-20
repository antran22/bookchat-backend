import pino from "pino";
import path from "path";

export const logger = pino({
  redact: ["*.password"],
  level: process.env.NODE_ENV === "production" ? "info" : "trace",
});

export function getModuleLogger(fileName: string) {
  return logger.child({
    module: getModuleName(fileName),
  });
}

export const expressLogger = logger.child({
  module: "express",
});

export function getModuleName(fileName: string) {
  return path.relative(process.cwd(), fileName);
}
