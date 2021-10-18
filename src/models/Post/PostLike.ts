import { requiredProp } from "@/utils/typegoose";
import { getModelForClass, index, Ref } from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";
import { User, UserJSON } from "../User";
import { Post, PostJSON } from "./Post";

@index({ user: 1, post: 1 }, { unique: true }) // compound index
export class PostLike extends DatabaseModel {
  @requiredProp({ ref: () => User })
  user!: Ref<User>;

  @requiredProp({ ref: () => Post })
  post!: Ref<Post>;

  async jsonify(populateFields?: (keyof PostLike)[]): Promise<PostLikeJSON> {
    await this.populateFields(populateFields);

    const userJSON = await User.jsonifyReferenceField(this.user);
    const postJSON = await Post.jsonifyReferenceField(this.post);

    return {
      _id: this._id.toString(),
      user: userJSON,
      post: postJSON,
      createdAt: this.createdAt || new Date(),
    };
  }
}

export type PostLikeJSON = {
  _id: string;
  createdAt: Date;
  user?: UserJSON;
  post?: PostJSON;
};

export const PostLikeModel = getModelForClass(PostLike);
