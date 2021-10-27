import {
  Delete,
  Path,
  Post,
  Put,
  Request,
  Route,
  Security,
  Tags,
} from "@tsoa/runtime";
import type express from "express";
import { FriendRequestJSON, FriendshipJSON } from "@/models/Friendship";
import {
  createFriendRequest,
  deleteFriendRequest,
} from "@/services/Friendship/FriendRequest";
import { DeleteResult } from "../_ControllerUtils";
import { acceptFriendRequest } from "@/services/Friendship";

@Tags("Friend Request")
@Route("friend_request")
export class FriendRequestController {
  // Todo: list friend requests.

  /**
   * Send a friend request
   */
  @Security("jwt")
  @Post("/{recipientId}/")
  public async sendFriendRequest(
    @Request() request: express.Request,
    @Path() recipientId: string
  ): Promise<FriendRequestJSON> {
    const friendRequest = await createFriendRequest(request.user, recipientId);
    // Todo: notify about friend request
    return friendRequest;
  }

  /**
   * Delete a friend request
   */
  @Security("jwt")
  @Delete("/{recipientId}/")
  public async unsendFriendRequest(
    @Request() request: express.Request,
    @Path() recipientId: string
  ): Promise<DeleteResult<FriendRequestJSON>> {
    return deleteFriendRequest(request.user, recipientId);
  }

  /**
   * create a friendship
   */
  @Security("jwt")
  @Put("/{senderId}/accept")
  public async AcceptFriendRequest(
    @Request() request: express.Request,
    @Path() senderId: string
  ): Promise<FriendshipJSON> {
    const friendship = await acceptFriendRequest(request.user, senderId);
    // Todo: notify new friendship
    return friendship;
  }
}
