export * from "./Google";
export * from "./JWT";
export * from "./Local";

export type AuthenticationResult = {
  token: string;
  isNew: boolean;
} | null;
