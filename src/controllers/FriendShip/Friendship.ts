import { 
	Delete,
	Path, 
	Put, 
	Security, 
	Tags,
	Request,
    Route
} from "@tsoa/runtime";
import type express from "express";
import { FriendshipJSON } from "@/models/Friendship";
import { acceptFriendship, deleteFriendship } from "@/services/Friendship";
import { DeleteResult } from "../_ControllerUtils";

@Tags("Friendship")
@Route("friendship")
export class FriendshipController {
    /**
     * create a friendship 
     */
    @Security("jwt")
    @Put("/{senderId}/accept")
    public async AcceptFriendRequest(
        @Request() request: express.Request,
        @Path() senderId: string
    ): Promise<FriendshipJSON> {
        const friendship = await acceptFriendship(request.user, senderId);
        return friendship;
    }

    /**
     * Delete a friendship
     */
    @Security("jwt")
    @Delete("/{senderId}/unfriend")
    public async UnFriendship(
        @Request() request: express.Request,
        @Path() senderId: string
    ): Promise<DeleteResult<FriendshipJSON>> {
        return deleteFriendship(request.user, senderId);
    }
}
