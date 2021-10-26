import { ListOptions } from "@/models/_BaseModel";
import {
  BookReview,
  BookReviewJSON,
  BookReviewModel,
} from "@/models/Book/BookReview";
import { User } from "@/models/User";
import { BadRequestException, NotFoundException, Optional } from "@/utils";
import { Error as MongooseError, Types } from "mongoose";

export async function getReviewsForBook(
  bookId: string,
  listOptions: ListOptions
): Promise<BookReviewJSON[]> {
  const reviews = await BookReviewModel.listByCursor(listOptions)
    .where("book", bookId)
    .exec();

  return BookReview.jsonifyAll(reviews, ["user"]);
}

export async function getReviewsByUser(
  userId: string,
  listOptions: ListOptions
) {
  const reviews = await BookReviewModel.listByCursor(listOptions)
    .where("user", userId)
    .exec();

  return BookReview.jsonifyAll(reviews, ["user"]);
}

export async function getReviewByUserForBook(
  user: User,
  bookId: string
): Promise<BookReviewJSON> {
  const review = await BookReviewModel.findOne()
    .where("user", user._id)
    .where("book", bookId)
    .exec();

  if (!review) {
    throw new NotFoundException(
      `Cannot find BookReview by user ${user._id} for book ${bookId}`
    );
  }

  return review.jsonify(["user", "book"]);
}

export interface CreateBookReviewInput {
  rating: number;
  content: string;
}

export async function createBookReview(
  user: User,
  bookId: string,
  input: CreateBookReviewInput
): Promise<BookReviewJSON> {
  try {
    const review = await BookReviewModel.create({
      user: user._id,
      book: bookId,
      ...input,
    });
    return review.jsonify(["book"]);
  } catch (e) {
    if (e instanceof MongooseError && e.message.includes("E1100")) {
      // Duplicate key
      throw new BadRequestException("You have already reviewed this book");
    }
    throw e;
  }
}

export type UpdateBookReviewInput = Optional<CreateBookReviewInput>;

export async function updateBookReview(
  user: User,
  bookId: string,
  input: UpdateBookReviewInput
): Promise<BookReviewJSON> {
  const review = await BookReviewModel.findOneAndUpdate(
    {
      user: user._id,
      book: bookId,
    },
    input,
    { new: true }
  );

  if (!review) {
    throw new NotFoundException(
      `User ${user._id} hasn't reviewd book ${bookId}`
    );
  }

  return review.jsonify(["book"]);
}

export async function deleteBookReview(
  user: User,
  bookId: string
): Promise<BookReviewJSON> {
  const review = await BookReviewModel.findOneAndDelete({
    user: user._id,
    book: bookId,
  });

  if (!review) {
    throw new NotFoundException(
      `User ${user._id} hasn't reviewed book ${bookId}`
    );
  }

  return review.jsonify(["book"]);
}

export async function calculateAverageReview(bookId: string) {
  const result: { averageReview: number }[] = await BookReviewModel.aggregate([
    {
      $match: {
        book: new Types.ObjectId(bookId),
      },
    },
    {
      $group: {
        _id: null,
        averageReview: {
          $avg: "$rating",
        },
      },
    },
  ]);

  return result[0].averageReview;
}
