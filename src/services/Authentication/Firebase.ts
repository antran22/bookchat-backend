import * as firebase from "firebase-admin";
import type { AuthenticationResult } from "./index";
import { signAccessToken } from "./index";
import { getModuleLogger } from "@/utils";
import { UnauthorizedException } from "@/utils/exceptions";
import { getUserOrCreateNew } from "@/services/User";

const firebaseAuthenticationLogger = getModuleLogger(__filename);

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
    const { user, isNew } = await getUserOrCreateNew(firebaseUser);
    return {
      token: signAccessToken(user),
      isNew,
    };
  } catch (e) {
    firebaseAuthenticationLogger.debug({ error: e }, "Verification failed");
    throw new UnauthorizedException("Cannot validate id token");
  }
}
