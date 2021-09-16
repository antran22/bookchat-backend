import { requiredProp, TypegooseDocument } from "@/utils/typegoose";
import {getModelForClass, isDocument, prop, Ref} from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";
import { UserJSON, User } from "../User";

export class Post extends DatabaseModel {
  @requiredProp({ ref: () => User })
  author!: Ref<User>;

  @requiredProp()
  content!: string;

  @prop({ type: () => [String] })
  attachments!: string[];

  async jsonify(this: TypegooseDocument<Post>): Promise<PostJSON> {
    await this.populate("author").execPopulate();
    const authorJSON = isDocument(this.author)
      ? await this.author.jsonify()
      : undefined;
    return {
      author: authorJSON,
      content: this.content,
      attachments: this.attachments,
      createdAt: this.createdAt || new Date(),
      _id: this._id.toString(),
    };
  }
}

export interface PostJSON {
  _id: string;
  createdAt: Date;
  author?: UserJSON;
  content: string;
  attachments: string[];
}

export const PostModel = getModelForClass(Post);
