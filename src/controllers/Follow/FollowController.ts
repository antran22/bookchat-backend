import {
  Delete,
  Get,
  Path,
  Post,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "@tsoa/runtime";
import type express from "express";
import { FollowJSON } from "@/models/Follow";
import {
  listFollow,
  makeMeFollowUser,
  makeMeUnfollowUser,
} from "@/services/Follow";
import { DeleteResult, Listing, wrapListingResult } from "../_ControllerUtils";

@Tags("Follow")
@Route("follow")
export class FollowController {
  /**
   * List following. If you need to list following to an user, set toUserId to that user's _id.
   * If you need to list following from an user, set fromUserId to that user's _id.
   */
  @Security("jwt")
  @Get("/")
  public async listFollow(
    @Request() request: express.Request,
    @Query() limit: number,
    @Query() cursor?: string,
    /** can be set to "me" or an arbitrary userId */
    @Query() fromUserId?: string,
    /** can be set to "me" or an arbitrary userId */
    @Query() toUserId?: string
  ): Promise<Listing<FollowJSON>> {
    if (fromUserId === "me") {
      fromUserId = request.user._id.toString();
    }
    if (toUserId === "me") {
      toUserId = request.user._id.toString();
    }
    const follows = await listFollow({ limit, cursor, fromUserId, toUserId });
    return wrapListingResult(follows, request);
  }

  /**
   * Follow a user
   */
  @Security("jwt")
  @Post("/to/{userId}")
  public async followUser(
    @Request() request: express.Request,
    @Path() userId: string
  ): Promise<FollowJSON> {
    return makeMeFollowUser(request.user, userId);
  }

  @Security("jwt")
  @Delete("/to/{userId}")
  public async unfollowUser(
    @Request() request: express.Request,
    @Path() userId: string
  ): Promise<DeleteResult<FollowJSON>> {
    return makeMeUnfollowUser(request.user, userId);
  }
}
