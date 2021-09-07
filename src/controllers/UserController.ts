import {
  Get,
  Path,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "@tsoa/runtime";
import { SanitisedUser, UserModel } from "@/models/User";
import type express from "express";
import { NotFoundException } from "@/utils/exceptions";
import { env } from "@/utils";

@Tags("User")
@Route("users")
export class UsersController {
  /**
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 users at once
   */
  @Get("/")
  public async list(
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<UserListing> {
    const users = await UserModel.listByCursor(limit, cursor);
    const sanitisedUser = users.map((u) => u.sanitise());
    const nextUrl = env.resolveAPIPath(
      `/users?cursor=${sanitisedUser[sanitisedUser.length - 1]._id}`
    );
    return {
      users: sanitisedUser,
      nextUrl,
    };
  }

  @Security("jwt")
  @Get("me")
  public async getMyInfo(
    @Request() request: express.Request
  ): Promise<SanitisedUser> {
    return request.user.sanitise();
  }

  @Get("{id}")
  public async get(@Path() id: string): Promise<SanitisedUser> {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Cannot find an user with such ID`);
    }
    return user.sanitise();
  }
}

interface UserListing {
  users: SanitisedUser[];
  nextUrl: string;
}
