import {ListOptions} from "@/models/_BaseModel";
import {BookJSON, BookModel, BookOwnershipJSON, BookOwnershipModel,} from "@/models/Book";
import {BadRequestException, NotFoundException} from "@/utils";
import {Error as MongooseError} from "mongoose";

export async function listBookInUserBookshelf(
  ownerId: string,
  options: ListBookshelfOptions
): Promise<BookJSON[]> {
  const bookOwnerships = await BookOwnershipModel.listByCursor(options)
    .where("owner", ownerId)
    .exec();

  return Promise.all(
    bookOwnerships.map(async (ownership) => {
      const ownershipJSON = await ownership.jsonify(["book"]);
      return ownershipJSON.book!;
    })
  );
}

export interface ListBookshelfOptions extends ListOptions {}

export async function addBookOwnedByUser(
  ownerId: string,
  input: CreateBookshelfOwnershipInput
): Promise<BookOwnershipJSON> {
  if (!(await BookModel.exists({ _id: input.bookId }))) {
    throw new NotFoundException(`Cannot find book with id ${input.bookId}`);
  }

  try {
    const ownership = await BookOwnershipModel.create({
      owner: ownerId,
      book: input.bookId,
    });
    return ownership.jsonify(["owner", "book"]);
  } catch (e) {
    if (e instanceof MongooseError.ValidationError) {
      // it might be that this ownership has already existed
      throw new BadRequestException("You might have already owned this book");
    }
    throw e;
  }
}

export interface CreateBookshelfOwnershipInput {
  bookId: string;
}

export async function removeOwnedBookFromShelf(
  ownerId: string,
  bookId: string
): Promise<BookOwnershipJSON> {
  const ownership = await BookOwnershipModel.findOneAndDelete({
    owner: ownerId,
    book: bookId,
  });

  if (!ownership) {
    throw new NotFoundException(`User ${ownerId} hasn't owned book ${bookId}`);
  }

  return ownership.jsonify(["owner", "book"]);
}
