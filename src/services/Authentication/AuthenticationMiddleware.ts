import type express from "express";
import { decodeAccessToken } from "./JWT";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "@/utils/exceptions";
import { User, UserModel } from "@/models/User";
import _ from "lodash";
import { expressLogger } from "@/utils";

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<User> {
  if (securityName === "jwt") {
    expressLogger.debug({ scopes }, "JWT authentication initiated with scopes");
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      throw new UnauthorizedException(
        "An access token is required to access this route"
      );
    }
    if (!_.isString(authHeader)) {
      throw new BadRequestException(
        "Access token must be included in the requester header as Bearer token"
      );
    }

    const token = authHeader.replace("Bearer ", "");
    if (token.length === 0) {
      throw new UnauthorizedException(
        "An access token is required to access this route"
      );
    }

    const jwtPayload = await decodeAccessToken(token);
    if (!jwtPayload) {
      throw new UnauthorizedException("Invalid access token supplied");
    }

    const user = await UserModel.findById(jwtPayload.userId).exec();
    if (!user || !user.active) {
      throw new UnauthorizedException("Invalid access token supplied");
    }

    if (_.includes(scopes, "admin") && !user.isAdmin) {
      throw new ForbiddenException("Cannot access admin specific route");
    }

    return user;
  }
  throw new Error(`Security type ${securityName} is not yet defined`);
}
