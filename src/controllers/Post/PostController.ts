import {
  Delete,
  FormField,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
  UploadedFiles,
} from "@tsoa/runtime";
import { PostJSON, PostLikeJSON, PostModel } from "@/models/Post";
import type express from "express";
import { env, ForbiddenException, getLastID, NotFoundException } from "@/utils";
import type { DeleteResult, Listing } from "../_ControllerUtils";
import {
  createPost,
  listLikeFromPost,
  listPostWithHaveLiked,
  makeUserLikePost,
  makeUserUnlikePost,
  PostJSONWithHasLiked,
} from "@/services/Post";

@Tags("Post")
@Route("posts")
export class PostsController {
  /**
   * List out all the posts.
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 posts at once
   */
  @Get("/")
  public async list(
    @Request() request: express.Request,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<PostJSONWithHasLiked>> {
    const postJSONs = await listPostWithHaveLiked({
      user: request.user,
      limit,
      cursor,
    });

    const lastPostId = getLastID(postJSONs);

    const nextUrl = lastPostId
      ? env.resolveAPIPath(`/posts`, {
          cursor: lastPostId,
          limit,
        })
      : undefined;
    return {
      data: postJSONs,
      nextUrl,
    };
  }

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
      throw new NotFoundException(`Cannot find Post with ID ${postId}`);
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
    return makeUserLikePost({ user: request.user, postId });
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

  /**
   * Get a post
   */
  @Get("/{postId}")
  public async getPost(
    @Request() request: express.Request,
    @Path() postId: string
  ): Promise<PostJSON> {
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException(`There is no Post with ID ${postId}`);
    }
    return post.jsonify();
  }

  /**
   * Create a new Post
   */
  @Security("jwt")
  @Post("/")
  public async createPost(
    @Request() request: express.Request,
    @FormField() content: string,
    @UploadedFiles() attachments: Express.Multer.File[]
  ): Promise<PostJSON> {
    const post = await createPost({
      author: request.user,
      content,
      attachments,
    });
    // Todo: Notify SocketIO about this post
    return post;
  }

  /**
   * Delete a post
   */
  @Security("jwt")
  @Delete("/{postId}")
  public async deletePost(
    @Request() request: express.Request,
    @Path() postId: string
  ): Promise<PostJSON> {
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException(`There is no Post with ID ${postId}`);
    }
    if (post.author !== request.user._id) {
      throw new ForbiddenException("You cannot delete this Post");
    }
    return post.jsonify();
  }
}


