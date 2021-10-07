import {Post, PostJSON, PostModel} from "@/models/Post";
import {User} from "@/models/User";
import {countLikeInPost, hasUserLikedPost} from "@/services/Post/PostLike";
import {ModelNotFoundException, multipleMulterFilesToStaticUrls,} from "@/utils";
import {ListOptions} from "@/models/_BaseModel";
import {countCommentInPost} from "@/services/Post/PostComment";

export async function createPost(input: CreatePostInput): Promise<Post> {
  const attachmentUrls = await multipleMulterFilesToStaticUrls(
    input.attachments
  );
  return PostModel.create({
    author: input.author._id,
    content: input.content,
    attachments: attachmentUrls,
  });
}

interface CreatePostInput {
  author: User;
  content: string;
  attachments?: Express.Multer.File[];
}

export async function listPostWithHaveLiked(
  options: ListPostOptions,
  currentUser: User
): Promise<ExtendedPostJSON[]> {
  let query = PostModel.listByCursor(options);
  if (options.userId) {
    query = query.where("author", options.userId);
  }

  const posts = await query.exec();
  const postJSONs = await Post.jsonifyAll(posts);

  return Promise.all(
    postJSONs.map(async (postJSON) => {
      return {
        ...postJSON,
        commentCount: await countCommentInPost(postJSON._id),
        likeCount: await countLikeInPost(postJSON._id),
        hasLiked: currentUser
          ? await hasUserLikedPost(currentUser, postJSON._id)
          : undefined,
      };
    })
  );
}

export interface ListPostOptions extends ListOptions {
  userId?: string;
}

export async function getPostWithHasLiked(
  input: GetPostInput
): Promise<ExtendedPostJSON> {
  const post = await PostModel.findById(input.postId).exec();
  if (!post) {
    throw new ModelNotFoundException(PostModel, input.postId);
  }
  const postJSON = await post.jsonify();
  return {
    ...postJSON,
    commentCount: await countCommentInPost(input.postId),
    likeCount: await countLikeInPost(input.postId),
    hasLiked: input.user
      ? await hasUserLikedPost(input.user, postJSON._id)
      : undefined,
  };
}

export interface GetPostInput {
  user?: User;
  postId: string;
}

export interface ExtendedPostJSON extends PostJSON {
  hasLiked?: boolean;
  commentCount: number;
  likeCount: number;
}
