import { ListInput } from "../_ServiceUtils";
import { Post, PostJSON, PostModel } from "@/models/Post";
import { Types } from "mongoose";
import { User } from "@/models/User";
import { hasUserLikedPost } from "@/services/Post/PostLike";
import { multipleMulterFilesToStaticUrls, NotFoundException } from "@/utils";

export async function createPost(input: CreatePostInput): Promise<PostJSON> {
  const attachmentUrls = await multipleMulterFilesToStaticUrls(
    input.attachments
  );
  const post = await PostModel.create({
    author: input.author._id,
    content: input.content,
    attachments: attachmentUrls,
  });
  return post.jsonify();
}

interface CreatePostInput {
  author: User;
  content: string;
  attachments: Express.Multer.File[];
}

export async function listPostWithHaveLiked(
  input: ListPostInput
): Promise<PostJSONWithHasLiked[]> {
  let query;
  if (input.cursor) {
    query = PostModel.find({
      _id: {
        $gt: new Types.ObjectId(input.cursor),
      },
    });
  } else {
    query = PostModel.find();
  }

  const posts = await query.limit(input.limit).exec();
  const postJSONs = await Post.jsonifyAll(posts);
  return Promise.all(
    postJSONs.map(async (postJSON) => {
      return {
        ...postJSON,
        hasLiked: input.user
          ? await hasUserLikedPost(input.user, postJSON._id)
          : undefined,
      };
    })
  );
}

export interface ListPostInput extends ListInput {
  user?: User;
}

export async function getPostWithHasLiked(
  input: GetPostInput
): Promise<PostJSONWithHasLiked> {
  const post = await PostModel.findById(input.postId).exec();
  if (!post) {
    throw new NotFoundException(`Cannot find Post with ID ${input.postId}`);
  }
  const postJSON = await post.jsonify();
  return {
    ...postJSON,
    hasLiked: input.user
      ? await hasUserLikedPost(input.user, postJSON._id)
      : undefined,
  };
}

export interface GetPostInput {
  user?: User;
  postId: string;
}

export interface PostJSONWithHasLiked extends PostJSON {
  hasLiked?: boolean;
}
