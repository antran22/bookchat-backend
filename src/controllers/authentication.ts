import type express from "express";
import { decodeJWTToken } from "@/services/Authentication";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "@/controllers/exceptions";
import { User, UserModel } from "@/models/User";
import _ from "lodash";

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

    const jwtPayload = await decodeJWTToken(token);
    if (!jwtPayload) {
      throw new UnauthorizedException("Invalid access token supplied");
    }

    if (scopes) {
      for (let scope of scopes) {
        if (!jwtPayload.accessScope.includes(scope)) {
          throw new ForbiddenException(
            "Access token has insufficient permission"
          );
        }
      }
    }

    const user = await UserModel.findById(jwtPayload.userId);
    if (!user) {
      throw new UnauthorizedException("Invalid access token supplied");
    }
    return user;
  }
  throw new Error(`Security type ${securityName} is not yet defined`);
}
