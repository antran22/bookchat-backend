import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "@tsoa/runtime";
import { PostCommentJSON, PostLikeJSON, PostModel } from "@/models/Post";
import type express from "express";
import { env, getLastID, NotFoundException } from "@/utils";
import type { DeleteResult, Listing } from "./_ControllerUtils";
import {
  createPostComment,
  CreatePostCommentInput,
  deleteCommentFromPost,
  listCommentFromPost,
  updatePostComment,
  UpdatePostCommentInput,
} from "@/services/Post/PostComment";

@Tags("Post")
@Route("posts")
export class PostCommentsController {
  /**
   * List comments from a Post
   */
  @Get("/{postId}/comments/")
  public async listComment(
    @Path() postId: string,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<PostCommentJSON>> {
    if (!(await PostModel.exists({ _id: postId }))) {
      throw new NotFoundException(`Cannot find Post with ID ${postId}`);
    }
    const posts = await listCommentFromPost({ post: postId, cursor, limit });

    const lastId = getLastID(posts);

    return {
      data: posts,
      nextUrl: env.resolveAPIPath(`posts/${postId}/comments`, {
        limit,
        cursor: lastId,
      }),
    };
  }
  /**
   * Add a comment to a post
   */
  @Security("jwt")
  @Post("/{postId}/comments/")
  public async addComment(
    @Path() postId: string,
    @Request() request: express.Request,
    @Body() input: CreatePostCommentInput
  ): Promise<PostCommentJSON> {
    if (!(await PostModel.exists({ _id: postId }))) {
      throw new NotFoundException(`Cannot find Post with ID ${postId}`);
    }
    return createPostComment(postId, request.user, input);
  }

  /**
   * Delete a comment
   */
  @Security("jwt")
  @Delete("/comments/{commentId}")
  public async deleteComment(
    @Request() request: express.Request,
    @Path() commentId: string
  ): Promise<DeleteResult<PostLikeJSON>> {
    return deleteCommentFromPost(commentId, request.user);
  }

  /**
   * Update a comment
   */
  @Security("jwt")
  @Put("/comments/{commentId}")
  public async updateComment(
    @Request() request: express.Request,
    @Path() commentId: string,
    @Body() input: UpdatePostCommentInput
  ): Promise<PostLikeJSON> {
    return updatePostComment(commentId, request.user, input);
  }
}
