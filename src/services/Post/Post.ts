import { Post, PostJSON, PostModel } from "@/models/Post";
import { User } from "@/models/User";
import { hasUserLikedPost } from "@/services/Post/PostLike";
import { multipleMulterFilesToStaticUrls, NotFoundException } from "@/utils";
import { ListOptions } from "@/models/_BaseModel";

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
  options: ListPostOptions
): Promise<PostJSONWithHasLiked[]> {
  const posts = await PostModel.listByCursor(options).exec();

  const postJSONs = await Post.jsonifyAll(posts);

  return Promise.all(
    postJSONs.map(async (postJSON) => {
      return {
        ...postJSON,
        hasLiked: options.user
          ? await hasUserLikedPost(options.user, postJSON._id)
          : undefined,
      };
    })
  );
}

export interface ListPostOptions extends ListOptions {
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
