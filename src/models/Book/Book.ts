import { DatabaseModel } from "../_BaseModel";
import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User, UserJSON } from "../User";
import { requiredProp } from "@/utils";

export class Book extends DatabaseModel {
  @requiredProp()
  name!: string;

  @prop()
  thumbnail?: string;

  @requiredProp()
  description!: string;

  @prop()
  publisher?: string;

  @prop()
  publishDate?: Date;

  @requiredProp({ type: () => [String] })
  genres!: string[];

  @requiredProp({ ref: () => User })
  author!: Ref<User>;

  @prop({ ref: () => User })
  translator?: Ref<User>;

  @prop()
  price?: number;

  async jsonify(): Promise<BookJSON> {
    await this.populateFields(["author", "translator"]);
    return {
      _id: this._id.toString(),
      name: this.name,
      description: this.description,
      thumbnail: this.thumbnail,
      publisher: this.publisher,
      genres: this.genres,
      price: this.price,
      author: (await User.jsonifyReferenceField(this.author))!,
      translator: await User.jsonifyReferenceField(this.translator),
    };
  }
}

export type BookJSON = {
  _id: string;
  name: string;
  description: string;
  publisher?: string;
  publishDate?: Date;
  genres: string[];
  thumbnail?: string;
  price?: number;
  author: UserJSON;
  translator?: UserJSON;
};

export const BookModel = getModelForClass(Book);
