import { FriendshipModel,FriendshipJSON } from "@/models/Friendship/Friendship";
import { Types } from "mongoose";
import {  User, UserJSON , UserModel} from "@/models/User";
import { ListOptions } from "@/models/_BaseModel";
import { FriendRequestModel } from "@/models/Friendship";
import { deleteFriendRequest } from "@/services/Friendship/FriendRequest";
import { NotFoundException } from "@/utils";
import { DeleteResult } from "@/controllers/_ControllerUtils";

export async function listFriendsOfAnUser(
  userId: string,
  options: ListOptions
): Promise<UserJSON[]> {
  let query = FriendshipModel.find()
    .or([{ user1: userId }, { user2: userId }])
    .limit(options.limit);
  if (options.cursor) {
    query = query.where({ _id: { _gt: new Types.ObjectId(options.cursor) } });
  }
  const friendships = await query.exec();

  const friendIds = friendships.map(({ user1, user2 }) => {
    const user1IdString = (user1 as Types.ObjectId).toString();
    const user2IdString = (user2 as Types.ObjectId).toString();
    return user1IdString === userId ? user2IdString : user1IdString;
  });

  const friends = await UserModel.findByMultipleIds(friendIds);
  return User.jsonifyAll(friends);
}

export async function acceptFriendship (
  user2: User,
  user1: string
): Promise<FriendshipJSON> {
  let query = await FriendRequestModel.find({"sender": user2._id});
  if (query) {
    let friendship = await FriendshipModel.create({
      user1: user1,
      user2: user2._id
    });
    await deleteFriendRequest({
      recipientId: user1,
      sender: user2,
    });
    return friendship.jsonify();
  } else {
    throw new NotFoundException("cannot accept thid friendship");
  }
}

export async function deleteFriendship(
  user2: User,
  user1: string
): Promise<DeleteResult<FriendshipJSON>> {
  const friendship = await FriendshipModel.findOneAndDelete({
    user2: user2._id,
    user1: user1
  }).exec();
  if (!friendship) {
    throw new NotFoundException("You don't have friend with this user")
  }
  return {
    deleted: await friendship.jsonify(),
  }

}
