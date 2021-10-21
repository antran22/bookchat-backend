import { User } from "@/models/User";
import {
  FriendRequestJSON,
  FriendRequestModel,
} from "@/models/Friendship/FriendRequest";
import { DeleteResult } from "@/controllers/_ControllerUtils";
import { BadRequestException, NotFoundException } from "@/utils";
import { FriendshipJSON, FriendshipModel } from "@/models/Friendship";

export async function createFriendRequest(
  sender: User,
  recipientId: string
): Promise<FriendRequestJSON> {
  try {
    const friendRequest = await FriendRequestModel.create({
      sender: sender._id,
      recipient: recipientId,
    });
    return friendRequest.jsonify();
  } catch (e) {
    throw new BadRequestException("This request has been sented");
  }
}

export async function deleteFriendRequest(
  sender: User,
  recipientId: string
): Promise<DeleteResult<FriendRequestJSON>> {
  const friendRequest = await FriendRequestModel.findOneAndDelete({
    sender: sender._id,
    recipient: recipientId,
  }).exec();

  if (!friendRequest) {
    throw new NotFoundException("You haven't request this user");
  }

  return {
    deleted: await friendRequest.jsonify(),
  };
}

export async function acceptFriendRequest(
  recipient: User,
  senderId: string
): Promise<FriendshipJSON> {
  const friendRequest = await FriendRequestModel.findOne({
    sender: senderId,
  }).exec();

  if (!friendRequest) {
    throw new NotFoundException("Friend request not found");
  }

  await friendRequest.remove();

  const friendship = await FriendshipModel.create({
    user1: senderId,
    user2: recipient._id,
  });

  return friendship.jsonify();
}
