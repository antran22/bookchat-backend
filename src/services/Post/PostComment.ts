import { Types } from "mongoose";
import { ListOptions } from "@/models/_BaseModel";
import { User } from "@/models/User";
import { DeleteResult } from "@/controllers/_ControllerUtils";
import { ForbiddenException, NotFoundException } from "@/utils";
import { PostComment, PostCommentJSON, PostCommentModel } from "@/models/Post";
import { notifyNewPostComment } from "@/services/Notification/NotificationService";

export async function createPostComment(
  postId: string,
  user: User,
  input: CreatePostCommentInput
): Promise<PostCommentJSON> {
  const comment = await PostCommentModel.create({
    content: input.content,
    post: postId,
    user: user._id,
  });
  await notifyNewPostComment(comment);
  return comment.jsonify();
}

export interface CreatePostCommentInput {
  content: string;
}

async function getCommentAndCheckForOwnership(commentId: string, user: User) {
  const comment = await PostCommentModel.findById(commentId).exec();
  if (!comment) {
    throw new NotFoundException(`Cannot find PostComment with Id ${commentId}`);
  }
  if (!user.isAdmin || !user._id.equals(comment.user as Types.ObjectId)) {
    throw new ForbiddenException("You can only modify your own comments.");
  }
  return comment;
}

export async function deleteCommentFromPost(
  commentId: string,
  user: User
): Promise<DeleteResult<PostCommentJSON>> {
  const comment = await getCommentAndCheckForOwnership(commentId, user);
  await comment.delete();
  return {
    deleted: await comment.jsonify(),
  };
}

export async function updatePostComment(
  commentId: string,
  user: User,
  input: UpdatePostCommentInput
): Promise<PostCommentJSON> {
  const comment = await getCommentAndCheckForOwnership(commentId, user);

  comment.content = input.content;

  await comment.save();

  return comment.jsonify();
}

export interface UpdatePostCommentInput {
  content: string;
}

export async function listCommentFromPost(
  input: ListPostCommentOptions
): Promise<PostCommentJSON[]> {
  const comments = await PostCommentModel.listByCursor(input)
    .where("post", input.post)
    .limit(input.limit)
    .exec();

  return PostComment.jsonifyAll(comments, ["user"]);
}

export interface ListPostCommentOptions extends ListOptions {
  post: string;
}

export async function countCommentInPost(postId: string): Promise<number> {
  return PostCommentModel.count().where("post", postId).exec();
}
