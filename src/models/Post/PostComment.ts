import { requiredProp, TypegooseDocument } from "@/utils/typegoose";
import { getModelForClass, index, Ref } from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";
import { User, UserJSON } from "../User";
import { Post, PostJSON } from "./Post";

@index({ user: 1, post: 1 }, { unique: true })
export class PostComment extends DatabaseModel {
  @requiredProp({ ref: () => User })
  user!: Ref<User>;

  @requiredProp({ ref: () => Post })
  post!: Ref<Post>;

  @requiredProp()
  content!: string;

  async jsonify(
    this: TypegooseDocument<PostComment>,
    fields?: (keyof PostComment)[]
  ): Promise<PostCommentJSON> {
    await this.populateFields(fields);

    const userJSON = await User.jsonifyReferenceField(this.user);
    const postJSON = await Post.jsonifyReferenceField(this.post);

    return {
      _id: this._id.toString(),
      user: userJSON,
      post: postJSON,
      content: this.content,
      createdAt: this.createdAt || new Date(),
    };
  }
}

export type PostCommentJSON = {
  _id: string;
  createdAt: Date;
  user?: UserJSON;
  post?: PostJSON;
  content: string;
};

export const PostCommentModel = getModelForClass(PostComment);
