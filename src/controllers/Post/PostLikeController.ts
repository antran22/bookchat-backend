import {
  Delete,
  Get,
  Path,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "@tsoa/runtime";
import { PostLikeJSON, PostModel } from "@/models/Post";
import type express from "express";
import {
  env,
  getLastID,
  ModelNotFoundException,
  NotFoundException,
} from "@/utils";
import type { DeleteResult, Listing } from "../_ControllerUtils";
import {
  listLikeFromPost,
  makeUserLikePost,
  makeUserUnlikePost,
} from "@/services/Post";

@Tags("Post Likes")
@Route("posts")
export class PostLikesController {
  /**
   * All the likes of a post
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 likes at once
   */
  @Get("/{postId}/likes")
  public async listLike(
    @Request() request: express.Request,
    @Path() postId: string,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<PostLikeJSON>> {
    if (!(await PostModel.exists({ _id: postId }))) {
      throw new ModelNotFoundException(PostModel, postId);
    }
    const postLikeJSONs = await listLikeFromPost({
      post: postId,
      limit,
      cursor,
    });

    const lastPostId = getLastID(postLikeJSONs);

    const nextUrl = lastPostId
      ? env.resolveAPIPath(`/posts/{postId}/likes`, {
          cursor: lastPostId,
          limit,
        })
      : undefined;
    return {
      data: postLikeJSONs,
      nextUrl,
    };
  }

  /**
   * Like a post
   */
  @Security("jwt")
  @Put("/{postId}/likes")
  public async likePost(
    @Request() request: express.Request,
    @Path() postId: string
  ): Promise<PostLikeJSON> {
    if (!(await PostModel.exists({ _id: postId }))) {
      throw new NotFoundException(`Cannot find Post with ID ${postId}`);
    }
    return makeUserLikePost(request.user._id.toString(), postId);
  }

  /**
   * Dislike a post
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 likes at once
   */
  @Security("jwt")
  @Delete("/{postId}/likes")
  public async unlikePost(
    @Request() request: express.Request,
    @Path() postId: string
  ): Promise<DeleteResult<PostLikeJSON>> {
    if (!(await PostModel.exists({ _id: postId }))) {
      throw new NotFoundException(`Cannot find Post with ID ${postId}`);
    }
    return makeUserUnlikePost({ user: request.user, postId });
  }
}
