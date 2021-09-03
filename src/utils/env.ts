import dotenv from "dotenv";
import { join as pathJoin, resolve as pathResolve } from "path";
import _ from "lodash";
import { parseBoolean } from "./helpers";
import logger from "./logging";

const envPath = pathResolve(process.cwd(), process.env.ENV_FILE ?? ".env");
const environment = dotenv.config({
  path: envPath,
});

const envLogger = logger.child({ module: "env" });

envLogger.info(`Loaded ENV variables from ${envPath}`);
envLogger.info(
  { environments: environment.parsed },
  `Parsed environment variables`
);

function validateValue<T>(
  name: string,
  value: T | null | undefined,
  defaultValue: T | null | undefined
): T {
  if (_.isNil(defaultValue)) {
    if (_.isNil(value)) {
      // While this seems extreme, this ensure secrets are supplied properly
      envLogger.fatal(`Please set environment variable ${name}`);
      process.exit(1);
    }
    return value;
  }
  return value || defaultValue;
}

function env(n: string, defaultValue?: string): string {
  const value = process.env[n];
  envLogger.debug(`Env variable ${n} has raw value ${value}`);
  return validateValue(n, value, defaultValue);
}

env.int = (n: string, defaultValue?: number): number => {
  const rawValue = process.env[n];
  envLogger.debug(`Env variable ${n} has raw value ${rawValue}`);
  const value = rawValue ? parseInt(rawValue) : undefined;
  return validateValue(n, value, defaultValue);
};

env.bool = (n: string, defaultValue?: boolean): boolean => {
  const rawValue = process.env[n];
  envLogger.debug(`Env variable ${n} has raw value ${rawValue}`);
  const value = parseBoolean(rawValue);
  return validateValue(n, value, defaultValue);
};

export enum NodeEnv {
  DEVELOPMENT = "development",
  TESTING = "testing",
  PRODUCTION = "production",
}

env.nodeEnv = (): NodeEnv => {
  let nodeEnv = process.env.NODE_ENV ?? "development";
  switch (nodeEnv.toLowerCase()) {
    case "development":
      return NodeEnv.DEVELOPMENT;
    case "testing":
      return NodeEnv.TESTING;
    case "production":
      return NodeEnv.PRODUCTION;
    default:
      return NodeEnv.DEVELOPMENT;
  }
};

env.isNodeEnv = (nodeEnv: NodeEnv): boolean => {
  return env.nodeEnv() === nodeEnv;
};

env.projectPath = (...paths: string[]): string => {
  envLogger.debug(`Process working directory is ${process.cwd()}`);
  return pathJoin(process.cwd(), ...paths);
};

export default env;
