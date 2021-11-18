import {
  Delete,
  FormField,
  Get,
  Path,
  Post,
  Query,
  Request,
  Route,
  Security,
  Tags,
  UploadedFiles,
} from "@tsoa/runtime";
import { PostJSON, PostModel } from "@/models/Post";
import type express from "express";
import { ForbiddenException, NotFoundException } from "@/utils";
import type { DeleteResult, Listing } from "../_ControllerUtils";
import { wrapListingResult } from "../_ControllerUtils";
import {
  createPost,
  ExtendedPostJSON,
  getPostWithHasLiked,
  listPostWithHaveLiked,
} from "@/services/Post";
import { notifyNewPost } from "@/services/Notification";

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
    @Query() cursor?: string,
    @Query() userId?: string
  ): Promise<Listing<ExtendedPostJSON>> {
    const postJSONs = await listPostWithHaveLiked(
      {
        limit,
        cursor,
        userId,
      },
      request.user
    );

    return wrapListingResult(postJSONs, request);
  }

  /**
   * Get a post
   */
  @Get("/{postId}")
  public async getPost(
    @Request() request: express.Request,
    @Path() postId: string
  ): Promise<ExtendedPostJSON> {
    return getPostWithHasLiked({ postId, user: request.user });
  }

  /**
   * Create a new Post
   */
  @Security("jwt")
  @Post("/")
  public async createPost(
    @Request() request: express.Request,
    @FormField() content: string,
    @UploadedFiles() attachments?: Express.Multer.File[]
  ): Promise<PostJSON> {
    const post = await createPost({
      author: request.user,
      content,
      attachments,
    });
    await notifyNewPost(post);
    return post.jsonify();
  }

  /**
   * Delete a post
   */
  @Security("jwt")
  @Delete("/{postId}")
  public async deletePost(
    @Request() request: express.Request,
    @Path() postId: string
  ): Promise<DeleteResult<PostJSON>> {
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException(`There is no Post with ID ${postId}`);
    }
    if (!request.user.isAdmin || post.author !== request.user._id) {
      throw new ForbiddenException("You cannot delete this Post");
    }
    return {
      deleted: await post.jsonify(),
    };
  }
}
