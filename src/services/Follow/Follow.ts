import { FollowJSON, FollowModel } from "@/models/Follow/Follow";
import { User } from "@/models/User";
import { BadRequestException, NotFoundException } from "@/utils";
import { DeleteResult } from "@/controllers/_ControllerUtils";

export async function makeUserFollow(
  input: CreateFollowInput
): Promise<FollowJSON> {
  try {
    const follow = await FollowModel.create({
      follower: input.follower._id,
      followee: input.followee,
    });
    return follow.jsonify();
  } catch (e) {
    throw new BadRequestException("This user has been followed");
  }
}

export interface CreateFollowInput {
  follower: User;
  followee: string;
}

export async function makeUserUnfollow(
  input: DeleteFollowInput
): Promise<DeleteResult<FollowJSON>> {
  const follow = await FollowModel.findOneAndDelete({
    follower: input.follower._id,
    followee: input.followee,
  }).exec();
  if (!follow) {
    throw new NotFoundException("You haven't follow this user");
  }
  return {
    deleted: await follow.jsonify(),
  };
}

export interface DeleteFollowInput {
  follower: User;
  followee: string;
}
