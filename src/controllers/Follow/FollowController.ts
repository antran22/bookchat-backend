import {
  Delete,
  Path,
  Put,
  Request,
  Route,
  Security,
  Tags,
} from "@tsoa/runtime";
import type express from "express";
import { FollowJSON } from "@/models/Follow/Follow";
import { makeUserFollow, makeUserUnfollow } from "@/services/Follow/Follow";
import { DeleteResult } from "../_ControllerUtils";

@Tags("Follow")
@Route("follow")
export class FollowController {
  /**
   * Follow a user
   */
  @Security("jwt")
  @Put("/{userId}/follow")
  public async Follow(
    @Request() request: express.Request,
    @Path() userId: string
  ): Promise<FollowJSON> {
    const follow = await makeUserFollow({
      follower: request.user,
      followee: userId,
    });
    return follow;
  }

  @Security("jwt")
  @Delete("/{userId}/follow")
  public async makeUserUnfollow(
    @Request() request: express.Request,
    @Path() userId: string
  ): Promise<DeleteResult<FollowJSON>> {
    return makeUserUnfollow({
      follower: request.user,
      followee: userId,
    });
  }
}
