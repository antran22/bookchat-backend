import { env, logger } from "@/utils";
import qs from "querystring";
import axios from "axios";
import type { AuthenticationResult } from "./index";
import { signAccessToken } from "./index";
import { UserModel } from "@/models/User";

const googleAuthenticationLogger = logger.child({
  module: "authentication/google",
});

export function getGoogleAuthenticationUrl() {
  const queries = {
    client_id: env("GOOGLE_CLIENT_ID"),
    redirect_uri: `${env("API_ROOT_URL")}/auth/google/callback`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  };
  return `https://accounts.google.com/o/oauth2/v2/auth?${qs.encode(queries)}`;
}

export interface GoogleAuthenticationQuery {
  code: string;
  state?: string;
}

export async function authenticateWithGoogle(
  query: GoogleAuthenticationQuery
): Promise<AuthenticationResult> {
  googleAuthenticationLogger.info("Authentication with Google");
  const accessToken = await exchangeGoogleAccessToken(query.code);
  const googleUserInfo = await getUserInfo(accessToken);
  const { user, isNew } = await UserModel.getUserOrCreateNew({
    email: googleUserInfo.email,
    fullName: googleUserInfo.name,
    avatar: googleUserInfo.picture,
  });
  return {
    token: signAccessToken(user),
    isNew,
  };
}

interface GoogleUserInfoResponse {
  family_name: string;
  name: string;
  picture: string;
  locale: string;
  email: string;
  given_name: string;
  id: string;
  verified_email: true;
}
async function getUserInfo(accessToken: string) {
  googleAuthenticationLogger.debug(
    { accessToken },
    "Using access token to get user info from Google APIs"
  );
  try {
    const userInfoResponse = await axios.get<GoogleUserInfoResponse>(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return userInfoResponse.data;
  } catch (e) {
    googleAuthenticationLogger.error(
      { error: e },
      "Error getting user info from google api"
    );
    throw e;
  }
}

interface GoogleAccessTokenResponse {
  access_token: string;
}
async function exchangeGoogleAccessToken(code: string): Promise<string> {
  googleAuthenticationLogger.debug(
    { code },
    "Exchanging auth code for access token"
  );
  try {
    const accessTokenResponse = await axios.post<GoogleAccessTokenResponse>(
      "https://oauth2.googleapis.com/token",
      {
        client_id: env("GOOGLE_CLIENT_ID"),
        client_secret: env("GOOGLE_CLIENT_SECRET"),
        code,
        grant_type: "authorization_code",
        redirect_uri: `${env("API_ROOT_URL")}/auth/google/callback`,
      }
    );

    return accessTokenResponse.data.access_token;
  } catch (e) {
    googleAuthenticationLogger.error(
      { error: e },
      "Cannot exchange auth code for access token"
    );
    throw e;
  }
}
