import {Body, Delete, Get, Path, Put, Query, Request, Route, Security, Tags,} from "@tsoa/runtime";
import type express from "express";
import {env, getLastID} from "@/utils";
import type {Listing} from "../_ControllerUtils";
import {
  addBookOwnedByUser,
  CreateBookshelfOwnershipInput,
  listBookInUserBookshelf,
  removeOwnedBookFromShelf,
} from "@/services/Book";
import {BookJSON, BookOwnershipJSON} from "@/models/Book";

@Tags("Bookshelf")
@Route("users")
export class BookshelfController {
  private static async list(
    request: express.Request,
    userId: string,
    limit: number,
    cursor?: string
  ) {
    const books = await listBookInUserBookshelf(userId, {
      limit,
      cursor,
    });

    const lastBookId = getLastID(books);

    const nextUrl = lastBookId
      ? env.resolveAPIPath(request.path, {
          cursor: lastBookId,
          limit,
        })
      : undefined;

    return {
      data: books,
      nextUrl,
    };
  }
  /**
   * List Book from current user's Bookshelf
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 books at once
   */
  @Security("jwt")
  @Get("/me/bookshelf")
  public async listFromMe(
    @Request() request: express.Request,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<BookJSON>> {
    return BookshelfController.list(
      request,
      request.user._id.toString(),
      limit,
      cursor
    );
  }

  /**
   * List Book from one user's Bookshelf
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 books at once
   */
  @Get("/{userId}/bookshelf")
  public async listFromAnyUser(
    @Request() request: express.Request,
    @Path() userId: string,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<BookJSON>> {
    return BookshelfController.list(request, userId, limit, cursor);
  }

  /**
   * Add a book you owned to your shelf
   */
  @Security("jwt")
  @Put("/me/bookshelf/own")
  public async addOwnedBookToMyShelf(
    @Request() request: express.Request,
    @Body() body: CreateBookshelfOwnershipInput
  ): Promise<BookOwnershipJSON> {
    return addBookOwnedByUser(request.user._id.toString(), body);
  }

  /**
   * Delete a book you owned from your shelf
   */
  @Security("jwt")
  @Delete("/me/bookshelf/own/{bookId}")
  public async deleteOwnershipFromMyShelf(
    @Request() request: express.Request,
    @Path() bookId: string
  ): Promise<BookOwnershipJSON> {
    return removeOwnedBookFromShelf(request.user._id.toString(), bookId);
  }
}
