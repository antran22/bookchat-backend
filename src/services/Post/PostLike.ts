import { PostLike, PostLikeJSON, PostLikeModel } from "@/models/Post";
import { Types } from "mongoose";
import { ListInput } from "../_ServiceUtils";
import { User } from "@/models/User";
import { DeleteResult } from "@/controllers/_ControllerUtils";
import { BadRequestException } from "@/utils";

export async function makeUserLikePost(
  input: CreatePostLikeInput
): Promise<PostLikeJSON> {
  try {
    const postLike = await PostLikeModel.create({
      post: input.postId,
      user: input.user._id,
    });
    return postLike.jsonify();
  } catch (e) {
    throw new BadRequestException("User have liked post already");
  }
}

export interface CreatePostLikeInput {
  postId: string;
  user: User;
}

export async function makeUserUnlikePost(
  input: DeletePostLikeInput
): Promise<DeleteResult<PostLikeJSON>> {
  const postLike = await PostLikeModel.findOneAndDelete({
    post: input.postId,
    user: input.user._id,
  }).exec();
  if (!postLike) {
    throw new BadRequestException(
      `User haven't liked post yet ${input.postId}`
    );
  }
  return {
    deleted: await postLike.jsonify(),
  };
}
export interface DeletePostLikeInput {
  postId: string;
  user: User;
}
export async function listLikeFromPost(
  input: ListPostLikeInput
): Promise<PostLikeJSON[]> {
  let query;
  if (input.cursor) {
    query = PostLikeModel.find({
      _id: {
        $gt: new Types.ObjectId(input.cursor),
      },
    });
  } else {
    query = PostLikeModel.find();
  }

  const postLikes = await query
    .where("post", input.post)
    .limit(input.limit)
    .exec();

  return PostLike.jsonifyAll(postLikes, ["user"]);
}

export interface ListPostLikeInput extends ListInput {
  post: string;
}

export async function countLikeFromPost(postId: string): Promise<number> {
  return PostLikeModel.count().where("post", postId).exec();
}

export async function hasUserLikedPost(
  user: User,
  postId: string
): Promise<boolean> {
  return PostLikeModel.exists({ user: user._id, post: postId });
}
