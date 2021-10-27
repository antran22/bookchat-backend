import {
  FriendshipJSON,
  FriendshipModel,
} from "@/models/Friendship/Friendship";
import { Types } from "mongoose";
import {  User, UserJSON , UserModel} from "@/models/User";
import { ListOptions } from "@/models/_BaseModel";
import { NotFoundException } from "@/utils";
import { DeleteResult } from "@/controllers/_ControllerUtils";

export async function listFriendsOfAnUser(
  userId: string,
  options: ListOptions
): Promise<UserJSON[]> {
  let query = FriendshipModel.listByCursor(options).or([
    { user1: userId },
    { user2: userId },
  ]);

  const friendships = await query.exec();

  const friendIds = friendships.map(({ user1, user2 }) => {
    const user1IdString = (user1 as Types.ObjectId).toString();
    const user2IdString = (user2 as Types.ObjectId).toString();
    return user1IdString === userId ? user2IdString : user1IdString;
  });

  const friends = await UserModel.findByMultipleIds(friendIds);
  return User.jsonifyAll(friends);
}

export async function deleteFriendship(
  me: User,
  friendId: string
): Promise<DeleteResult<FriendshipJSON>> {
  const friendship = await FriendshipModel.findOneAndDelete({
    $or: [
      {
        user1: friendId,
        user2: me._id,
      },
      {
        user1: me._id,
        user2: friendId,
      },
    ],
  }).exec();

  if (!friendship) {
    throw new NotFoundException("You don't have friend with this user");
  }

  return {
    deleted: await friendship.jsonify(),
  };
}
