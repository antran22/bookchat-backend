import { ListOptions } from "@/models/_BaseModel";
import { Book, BookJSON, BookModel } from "@/models/Book";
import { NotFoundException } from "@/utils";
import _ from "lodash";

export async function listBook(options: ListOptions): Promise<BookJSON[]> {
  const books = await BookModel.listByCursor(options).exec();
  return Book.jsonifyAll(books);
}

export async function createBook(input: MutateBookInput): Promise<BookJSON> {
  const book = await BookModel.create(input);
  return book.jsonify();
}

export async function updateBook(
  bookId: string,
  input: Partial<MutateBookInput>
): Promise<BookJSON> {
  const book = await BookModel.findById(bookId).exec();
  if (!book) {
    throw new NotFoundException(`Cannot find Book with id: ${bookId}`);
  }
  _.forOwn(input, (value, field) => {
    if (field && value) {
      book.set(field, value);
    }
  });
  await book.save();
  return book.jsonify();
}

interface MutateBookInput {
  name: string;
  description: string;
  /** Can either be the User._id refers to the author user object or just a name */
  author: string;
  /** Can either be the User._id refers to the translator user object or just a name */

  translator?: string;
  isbn?: string;
  publisher?: string;
  thumbnail?: string;
}
