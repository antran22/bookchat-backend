import {requiredProp} from "@/utils/typegoose";
import {getModelForClass, Ref} from "@typegoose/typegoose";
import {DatabaseModel} from "../_BaseModel";
import {User, UserJSON} from "../User";
import {Post, PostJSON} from "./Post";

export class PostComment extends DatabaseModel {
  @requiredProp({ ref: () => User })
  user!: Ref<User>;

  @requiredProp({ ref: () => Post })
  post!: Ref<Post>;

  @requiredProp()
  content!: string;

  async jsonify(fields?: (keyof PostComment)[]): Promise<PostCommentJSON> {
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
