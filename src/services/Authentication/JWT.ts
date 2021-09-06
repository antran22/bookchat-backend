import { env, logger } from "@/utils";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

const authenticationServiceLogger = logger.child({
  module: "authentication/jwt",
});

/**
 * The format of the JWT payload that is encoded into the token.
 */
interface AppJWTPayload {
  userId: string;
  accessScope: string[];
}

const jwtSecret = env("JWT_SECRET");
const jwtExpiry = env("JWT_EXPIRY", "1w");

/**
 * Sign a JWT token for a given user.
 */
export function signAccessToken(user: User): string {
  const payload: AppJWTPayload = {
    userId: user._id.toString(),
    accessScope: user.accessScope,
  };

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
}

/**
 * Decode a JWT token to get the payload.
 */
export async function decodeJWTToken(
  jwtToken: string
): Promise<AppJWTPayload | null> {
  try {
    return jwt.verify(jwtToken, jwtSecret) as AppJWTPayload;
  } catch (e) {
    authenticationServiceLogger.error({ error: e }, "Error decoding JWT");
    return null;
  }
}
