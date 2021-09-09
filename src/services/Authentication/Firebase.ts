import * as firebase from "firebase-admin";
import type { AuthenticationResult } from "./index";
import { logger } from "@/utils";
import { UserModel } from "@/models/User";
import { signAccessToken } from "./index";
import { UnauthorizedException } from "@/utils/exceptions";

const firebaseAuthenticationLogger = logger.child({
  module: "authentication/firebase",
});

export async function authenticateWithFirebase(
  idToken: string
): Promise<AuthenticationResult> {
  try {
    const decodedIdToken = await firebase.auth().verifyIdToken(idToken);
    firebaseAuthenticationLogger.debug(
      { decodedIdToken },
      "Verification successful"
    );
    const firebaseUser = await firebase.auth().getUser(decodedIdToken.uid);
    const { user, isNew } = await UserModel.getUserOrCreateNew(firebaseUser);
    return {
      token: signAccessToken(user),
      isNew,
    };
  } catch (e) {
    firebaseAuthenticationLogger.debug({ error: e }, "Verification failed");
    throw new UnauthorizedException("Cannot validate id token");
  }
}
