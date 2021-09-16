import { requiredProp, TypegooseDocument } from "@/utils/typegoose";
import { getModelForClass, Ref, index, isDocument } from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";
import { User, UserJSON } from "../User";
import { Post, PostJSON } from "./Post";

@index({ user: 1, post: 1 }, { unique: true }) // compound index
export class PostLike extends DatabaseModel {
  @requiredProp({ ref: () => User })
  user!: Ref<User>;

  @requiredProp({ ref: () => Post })
  post!: Ref<Post>;

  async jsonify(
    this: TypegooseDocument<PostLike>,
    populateFields?: (keyof PostLike)[]
  ): Promise<PostLikeJSON> {
    if (populateFields) {
      await this.populate(populateFields.join(" ")).execPopulate();
    }

    const userJSON = isDocument(this.user)
      ? await this.user.jsonify()
      : undefined;

    const postJSON = isDocument(this.post)
      ? await this.post.jsonify()
      : undefined;

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
