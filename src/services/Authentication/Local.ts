import { UserModel } from "@/models/User";
import { logger } from "@/utils";
import { signAccessToken } from "./JWT";
import type { AuthenticationResult } from "./index";

const authenticationServiceLogger = logger.child({
  module: "authentication/local",
});

/**
 * Interface of RequestBody for local authentication
 */
export interface LocalAuthenticationInput {
  email: string;
  password: string;
}

/**
 * Perform local authentication (using email with password)
 * @return A token if authentication successful, else null.
 */
export async function localAuthentication(
  input: LocalAuthenticationInput
): Promise<AuthenticationResult> {
  authenticationServiceLogger.info({ input }, "Local Authentication");
  const user = await UserModel.findOne().where("email", input.email).exec();

  if (!user) {
    authenticationServiceLogger.warn(`No such user found with input ${input}`);
    return null;
  }

  if (await user.isPasswordValid(input.password)) {
    return {
      token: signAccessToken(user),
      isNew: false,
    };
  }

  return null;
}
