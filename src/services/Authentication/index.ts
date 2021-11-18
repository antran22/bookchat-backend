export * from "./JWT";
export * from "./Firebase";
export * from "./AuthenticationMiddleware";

export interface AuthenticationResult {
  token: string;
  isNew: boolean;
}