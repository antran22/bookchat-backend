import { env, getModuleLogger } from "@/utils";
import type { User } from "@/models/User";
import jwt from "jsonwebtoken";

const jwtServiceLogger = getModuleLogger(__filename);

/**
 * The format of the JWT payload that is encoded into the token.
 */
interface AppJWTPayload {
  userId: string;
}

const jwtSecret = env("JWT_SECRET");
const jwtExpiry = env("JWT_EXPIRY", "1w");

/**
 * Sign a JWT token for a given user.
 */
export function signAccessToken(user: User): string {
  const payload: AppJWTPayload = {
    userId: user._id.toString(),
  };
  jwtServiceLogger.debug({ payload }, "Signing JWT for payload");
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
}

/**
 * Decode a JWT Access Token to get the encoded payload.
 */
export async function decodeAccessToken(
  jwtToken: string
): Promise<AppJWTPayload | null> {
  try {
    return jwt.verify(jwtToken, jwtSecret) as AppJWTPayload;
  } catch (e) {
    jwtServiceLogger.error({ error: e }, "Error decoding JWT");
    return null;
  }
}
