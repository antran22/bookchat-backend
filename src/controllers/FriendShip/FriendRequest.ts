import { 
	Delete,
	Path, 
	Put, 
	Route, 
	Security, 
	Tags,
	Request 
} from "@tsoa/runtime";
import type express from "express";
import { FriendRequestJSON } from "@/models/Friendship";
import { createFriendRequest, deleteFriendRequest } from "@/services/Friendship/FriendRequest";
import { DeleteResult } from "../_ControllerUtils";

@Tags("Friend")
@Route("friend")
export class FriendController {
	/**
	 * Send a friend request
	 */
	@Security("jwt")
	@Put("/{recipientId}/friendrequest")
	public async FriendRequest(
			@Request() request: express.Request,
			@Path() recipientId: string
	): Promise<FriendRequestJSON> {
		const friendRequest = await createFriendRequest({
			sender: request.user,
			recipientId: recipientId,
		});
		return friendRequest;
	}

	/**
	 * Delete a friend request
	 */
	@Security("jwt")
	@Delete("/{recipientId}/unfriendrequest")
	public async UnFriendRequest(
		@Request() request: express.Request,
		@Path() recipientId: string
	): Promise<DeleteResult<FriendRequestJSON>> {
		return deleteFriendRequest({
			sender: request.user,
			recipientId: recipientId,
		})
	}
}