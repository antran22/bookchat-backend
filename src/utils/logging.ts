import pino from "pino";

const logger = pino({
  redact: ["*.password"],
  level: "debug",
});

export const expressLogger = logger.child({
  module: "express",
});

export default logger;
