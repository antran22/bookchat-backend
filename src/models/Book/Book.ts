import { DatabaseModel } from "../_BaseModel";
import { getModelForClass, prop } from "@typegoose/typegoose";
import { User, UserJSON, UserModel } from "../User";
import { requiredProp } from "@/utils";
import { Types } from "mongoose";
import _ from "lodash";

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

  @prop()
  author?: string;

  @prop()
  price?: number;

  @prop()
  translator?: string;

  private static async getAuthorOrTranslator(
    field?: string
  ): Promise<User | string | null> {
    if (!field) {
      return null;
    }
    if (Types.ObjectId.isValid(field)) {
      const user = await UserModel.findById(field).exec();
      return user ?? null;
    }
    return field;
  }

  async getAuthor(): Promise<User | string | null> {
    return Book.getAuthorOrTranslator(this.author);
  }

  async getTranslator(): Promise<User | string | null> {
    return Book.getAuthorOrTranslator(this.translator);
  }

  async jsonify(): Promise<BookJSON> {
    const author = await this.getAuthor();
    const translator = await this.getTranslator();

    const authorJSON = _.isString(author) ? author : await author?.jsonify();
    const translatorJSON = _.isString(translator)
      ? translator
      : await translator?.jsonify();

    return {
      _id: this._id.toString(),
      name: this.name,
      description: this.description,
      thumbnail: this.thumbnail,
      publisher: this.publisher,
      genres: this.genres,
      price: this.price,
      author: authorJSON,
      translator: translatorJSON,
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
  author?: UserJSON | string;
  translator?: UserJSON | string;
};

export const BookModel = getModelForClass(Book);
