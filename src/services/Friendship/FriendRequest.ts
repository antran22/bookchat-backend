import { User } from "@/models/User";
import {
  FriendRequestJSON,
  FriendRequestModel,
} from "@/models/Friendship/FriendRequest";

export async function createFriendRequest(
  user: User,
  recipientId: string
): Promise<FriendRequestJSON> {
  const friendRequest = await FriendRequestModel.create({
    sender: user._id,
    recipient: recipientId,
  });
  return friendRequest.jsonify();
}
