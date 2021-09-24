import { ListOptions } from "@/services/_ServiceUtils";
import { FriendshipModel } from "@/models/Friendship/Friendship";
import { Types } from "mongoose";
import { getUsersWithIds } from "@/services/User";
import { User, UserJSON } from "@/models/User";

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

  const friends = await getUsersWithIds(friendIds);
  return User.jsonifyAll(friends);
}
