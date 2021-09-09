export * from "./JWT";
export * from "./Firebase";

export interface AuthenticationResult {
  token: string;
  isNew: boolean;
}
