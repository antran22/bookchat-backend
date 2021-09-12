import type express from "express";
import { decodeAccessToken } from "@/services/Authentication";
import { BadRequestException, UnauthorizedException } from "@/utils/exceptions";
import { User, UserModel } from "@/models/User";
import _ from "lodash";
import { env } from "@/utils";
import { expressLogger } from "@/utils";

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<User> {
  if (securityName === "jwt") {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      throw new UnauthorizedException(
        "An access token is required to access this route"
      );
    }
    if (!_.isString(authHeader)) {
      throw new BadRequestException(
        "Acess token must be included in the requester header as Bearer token"
      );
    }

    const token = authHeader.replace("Bearer ", "");
    if (token.length === 0) {
      throw new UnauthorizedException(
        "An access token is required to access this route"
      );
    }

    // This is a little bit insecure, and should be used for testing only.
    if (env.bool("ENABLE_MASTER_TOKEN", false)) {
      const masterToken = env("MASTER_TOKEN", "");
      if (masterToken.length > 10 && token === masterToken) {
        const user = await UserModel.findOne().sort({ _id: "asc" }).exec();
        if (user) {
          expressLogger.warn(
            { impersonatedUser: user },
            "Master token is being used."
          );
          return user;
        }
      }
    }

    const jwtPayload = await decodeAccessToken(token);
    if (!jwtPayload) {
      throw new UnauthorizedException("Invalid access token supplied");
    }

    const user = await UserModel.findById(jwtPayload.userId).exec();
    if (!user) {
      throw new UnauthorizedException("Invalid access token supplied");
    }
    return user;
  }
  throw new Error(`Security type ${securityName} is not yet defined`);
}
