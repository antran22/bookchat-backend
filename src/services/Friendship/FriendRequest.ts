import { User } from "@/models/User";
import {
  FriendRequestJSON,
  FriendRequestModel,
} from "@/models/Friendship/FriendRequest";
import { DeleteResult } from "@/controllers/_ControllerUtils";
import { BadRequestException, NotFoundException } from "@/utils";

export async function createFriendRequest(
  input: CreateFriendRequestInput
): Promise<FriendRequestJSON> {
  try {
    const friendRequest = await FriendRequestModel.create({
      sender: input.sender._id,
      recipient: input.recipientId,
    });
    return friendRequest.jsonify();
  } catch (e) {
    throw new BadRequestException("This request has been sented")
  }
}

export interface CreateFriendRequestInput {
  sender: User;
  recipientId: string;
}

export async function deleteFriendRequest(
  input: DeleteFriendRequestInput
): Promise<DeleteResult<FriendRequestJSON>> {
  const friendRequest = await FriendRequestModel.findOneAndDelete({
    sender: input.sender._id,
    recipient: input.recipientId,
  }).exec();
  if (!friendRequest) {
    throw new NotFoundException("You haven't request this user")
  }
  return {
    deleted: await friendRequest.jsonify(),
  }
}

export interface DeleteFriendRequestInput {
  sender: User;
  recipientId: string;
}
