import { Follow, FollowJSON, FollowModel } from "@/models/Follow";
import { User } from "@/models/User";
import { BadRequestException, NotFoundException } from "@/utils";
import { DeleteResult } from "@/controllers/_ControllerUtils";
import { ListOptions } from "@/models/_BaseModel";
import { Types } from "mongoose";

export interface FollowListOptions extends ListOptions {
  fromUserId?: string;
  toUserId?: string;
}
export async function listFollow(
  options: FollowListOptions
): Promise<FollowJSON[]> {
  let query = FollowModel.listByCursor(options);
  if (options.fromUserId) {
    query = query.where("fromUser", new Types.ObjectId(options.fromUserId));
  }
  if (options.toUserId) {
    query = query.where("toUser", new Types.ObjectId(options.toUserId));
  }

  const follows = await query.exec();

  return Follow.jsonifyAll(follows);
}

export async function makeMeFollowUser(
  fromUser: User,
  toUserId: string
): Promise<FollowJSON> {
  try {
    const follow = await FollowModel.create({
      fromUser: fromUser._id,
      toUser: toUserId,
    });
    return follow.jsonify();
  } catch (e) {
    throw new BadRequestException(
      `User ${fromUser._id} has already followed user ${toUserId}`
    );
  }
}

export async function makeMeUnfollowUser(
  fromUser: User,
  toUserId: string
): Promise<DeleteResult<FollowJSON>> {
  const follow = await FollowModel.findOneAndDelete({
    fromUser: fromUser._id,
    toUser: toUserId,
  }).exec();
  if (!follow) {
    throw new NotFoundException(
      `User ${fromUser._id} hasn't followed user ${toUserId} yet`
    );
  }
  return {
    deleted: await follow.jsonify(),
  };
}
