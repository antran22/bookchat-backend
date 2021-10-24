import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "@tsoa/runtime";
import type express from "express";
import type { DeleteResult, Listing } from "../_ControllerUtils";
import { wrapListingResult } from "../_ControllerUtils";
import { BookReviewJSON } from "@/models/Book";
import {
  calculateAverageReview,
  createBookReview,
  CreateBookReviewInput,
  deleteBookReview,
  getReviewByUserForBook,
  getReviewsForBook,
  updateBookReview,
  UpdateBookReviewInput,
} from "@/services/Book";

@Tags("Books Review")
@Route("books")
export class BookReviewController {
  /**
   * List Review
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 books at once
   */
  @Get("/{bookId}/reviews")
  public async listReviewForBook(
    @Request() request: express.Request,
    @Path() bookId: string,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<BookReviewJSON>> {
    const review = await getReviewsForBook(bookId, {
      limit,
      cursor,
    });

    return wrapListingResult(review, request);
  }

  /**
   * Create a review from an user for a book
   */
  @Security("jwt")
  @Get("/{bookId}/rating")
  public async getAverageRating(
    @Request() request: express.Request,
    @Path() bookId: string
  ): Promise<number> {
    return calculateAverageReview(bookId);
  }

  /**
   * Create a review from an user for a book
   */
  @Security("jwt")
  @Get("/{bookId}/my_review")
  public async getMyReview(
    @Request() request: express.Request,
    @Path() bookId: string
  ): Promise<BookReviewJSON> {
    return getReviewByUserForBook(request.user, bookId);
  }

  /**
   * Create a review from an user for a book
   */
  @Security("jwt")
  @Post("/{bookId}/my_review")
  public async createBookReview(
    @Request() request: express.Request,
    @Path() bookId: string,
    @Body() body: CreateBookReviewInput
  ): Promise<BookReviewJSON> {
    return createBookReview(request.user, bookId, body);
  }

  /**
   * Delete book review
   */
  @Security("jwt")
  @Delete("/{bookId}/my_review")
  public async deleteBookReview(
    @Request() request: express.Request,
    @Path() bookId: string
  ): Promise<DeleteResult<BookReviewJSON>> {
    const reviewJSON = await deleteBookReview(request.user, bookId);
    return {
      deleted: reviewJSON,
    };
  }

  /**
   * Update book review
   */
  @Security("jwt")
  @Put("/{bookId}/my_review")
  public async updateBookReview(
    @Request() request: express.Request,
    @Path() bookId: string,
    @Body() body: UpdateBookReviewInput
  ): Promise<BookReviewJSON> {
    return updateBookReview(request.user, bookId, body);
  }
}
