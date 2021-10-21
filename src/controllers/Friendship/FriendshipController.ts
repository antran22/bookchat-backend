import { Delete, Path, Request, Route, Security, Tags } from "@tsoa/runtime";
import type express from "express";
import { FriendshipJSON } from "@/models/Friendship";
import { deleteFriendship } from "@/services/Friendship";
import { DeleteResult } from "../_ControllerUtils";

@Tags("Friendship")
@Route("friendship")
export class FriendshipController {
  // Todo: list friends

  /**
   * Delete a friendship
   */
  @Security("jwt")
  @Delete("/{friendId}")
  public async unfriend(
    @Request() request: express.Request,
    @Path() friendId: string
  ): Promise<DeleteResult<FriendshipJSON>> {
    return deleteFriendship(request.user, friendId);
  }
}
