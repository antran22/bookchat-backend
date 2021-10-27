import { ListOptions } from "@/models/_BaseModel";
import { Book, BookJSON, BookModel } from "@/models/Book";
import { ModelNotFoundException, Optional } from "@/utils";
import { isValidObjectId, Types } from "mongoose";
import { UserModel } from "@/models/User";

export interface ListBookOption extends ListOptions {
  author?: string;
  translator?: string;
}
export async function listBook(options: ListBookOption): Promise<BookJSON[]> {
  let query = BookModel.listByCursor(options);
  if (options.author) {
    query = query.where("author").equals(options.author);
  }
  if (options.translator) {
    query = query.where("translator").equals(options.translator);
  }
  const books = await query.exec();
  return Book.jsonifyAll(books);
}

export interface CreateBookInput {
  name: string;
  description: string;
  /** Can either be the User._id refers to the author user object or just a name */
  author: string;
  /** Can either be the User._id refers to the translator user object or just a name */
  translator?: string;
  publisher?: string;
  publishDate?: Date;
  thumbnail?: string;
  genres: string[];
  price?: number;
}

async function getOrCreateUserIdWithIdOrName(
  idOrName?: string
): Promise<Types.ObjectId | undefined> {
  if (!idOrName) return undefined;
  if (isValidObjectId(idOrName)) {
    return new Types.ObjectId(idOrName);
  } else {
    let user = await UserModel.findOne({ displayName: idOrName }).exec();
    if (!user) {
      user = await UserModel.create({ displayName: idOrName, active: false });
    }
    return user._id;
  }
}

export async function createBook(input: CreateBookInput): Promise<BookJSON> {
  const creationInput = {
    ...input,
    author: await getOrCreateUserIdWithIdOrName(input.author),
    translator: await getOrCreateUserIdWithIdOrName(input.translator),
  };
  const book = await BookModel.create(creationInput);
  return book.jsonify();
}

export async function updateBook(
  bookId: string,
  input: UpdateBookInput
): Promise<BookJSON> {
  const book = await BookModel.findByIdAndUpdate(bookId, input).exec();
  if (!book) {
    throw new ModelNotFoundException(BookModel, bookId);
  }
  return book.jsonify();
}

export type UpdateBookInput = Optional<CreateBookInput>;
