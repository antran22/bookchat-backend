import { DatabaseModel } from "../_BaseModel";
import { getModelForClass, index, Ref } from "@typegoose/typegoose";
import { User, UserJSON } from "../User";
import { requiredProp } from "@/utils";
import { Book, BookJSON } from "./Book";
import { BookReadingStatus } from "./BookStatus";

@index({ book: 1, owner: 1 }, { unique: true })
export class BookOwnership extends DatabaseModel {
  @requiredProp({ ref: () => Book })
  book!: Ref<Book>;

  @requiredProp({ ref: () => User })
  owner!: Ref<User>;

  @requiredProp({ default: BookReadingStatus.UNREAD })
  status!: BookReadingStatus;

  async jsonify(fields: (keyof BookOwnership)[]): Promise<BookOwnershipJSON> {
    await this.populateFields(fields);

    return {
      _id: this._id.toString(),
      book: await Book.jsonifyReferenceField(this.book),
      owner: await User.jsonifyReferenceField(this.owner),
      status: this.status,
    };
  }
}

export type BookOwnershipJSON = {
  _id: string;
  book?: BookJSON;
  owner?: UserJSON;
  status: BookReadingStatus;
};

export const BookOwnershipModel = getModelForClass(BookOwnership);
