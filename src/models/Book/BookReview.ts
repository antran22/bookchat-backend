import {DatabaseModel} from "../_BaseModel";
import {getModelForClass, index, Ref} from "@typegoose/typegoose";
import {User, UserJSON} from "../User";
import {requiredProp} from "@/utils";
import {Book, BookJSON} from "./Book";

@index({ book: 1, user: 1 }, { unique: true })
export class BookReview extends DatabaseModel {
  @requiredProp({ ref: () => Book })
  book!: Ref<Book>;

  @requiredProp({ ref: () => User })
  user!: Ref<User>;

  @requiredProp({ min: 1, max: 5 })
  rating!: number;

  @requiredProp({ default: "" })
  content!: string;

  async jsonify(fields: (keyof BookReview)[]): Promise<BookReviewJSON> {
    await this.populateFields(fields);

    return {
      _id: this._id.toString(),
      book: await Book.jsonifyReferenceField(this.book),
      user: await User.jsonifyReferenceField(this.user),
      content: this.content,
      rating: this.rating,
    };
  }
}

export type BookReviewJSON = {
  _id: string;
  book?: BookJSON;
  user?: UserJSON;
  content: string;
  rating: number;
};

export const BookReviewModel = getModelForClass(BookReview);
