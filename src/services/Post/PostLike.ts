import {PostLike, PostLikeJSON, PostLikeModel} from "@/models/Post";
import {ListOptions} from "@/models/_BaseModel";
import {User} from "@/models/User";
import {DeleteResult} from "@/controllers/_ControllerUtils";
import {BadRequestException} from "@/utils";

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
  options: ListPostLikeOptions
): Promise<PostLikeJSON[]> {
  const postLikes = await PostLikeModel.listByCursor(options)
    .where("post", options.post)
    .limit(options.limit)
    .exec();

  return PostLike.jsonifyAll(postLikes, ["user"]);
}

export interface ListPostLikeOptions extends ListOptions {
  post: string;
}

export async function countLikeInPost(postId: string): Promise<number> {
  return PostLikeModel.count().where("post", postId).exec();
}

export async function hasUserLikedPost(
  user: User,
  postId: string
): Promise<boolean> {
  return PostLikeModel.exists({ user: user._id, post: postId });
}
