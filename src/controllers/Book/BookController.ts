import {Body, Delete, Get, Path, Post, Put, Query, Request, Route, Security, Tags,} from "@tsoa/runtime";
import type express from "express";
import {NotFoundException} from "@/utils";
import type {DeleteResult, Listing} from "../_ControllerUtils";
import {wrapListingResult} from "../_ControllerUtils";
import {createBook, CreateBookInput, listBook, updateBook, UpdateBookInput,} from "@/services/Book";
import {BookJSON, BookModel} from "@/models/Book";

@Tags("Books")
@Route("books")
export class BookController {
  /**
   * List Book
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 books at once
   */
  @Get("/")
  public async list(
    @Request() request: express.Request,
    @Query() limit: number,
    @Query() cursor?: string,
    @Query() author?: string,
    @Query() translator?: string
  ): Promise<Listing<BookJSON>> {
    const books = await listBook({
      limit,
      cursor,
      author,
      translator,
    });

    return wrapListingResult(books, request);
  }

  /**
   * Get a single book
   */
  @Get("/{bookId}")
  public async getBook(
    @Request() request: express.Request,
    @Path() bookId: string
  ): Promise<BookJSON> {
    const book = await BookModel.findById(bookId).exec();

    if (!book) {
      throw new NotFoundException(`Cannot find Book with id ${bookId}`);
    }

    return book.jsonify();
  }

  /**
   * Create a book. Upload thumbnails at /uploads and add the urls here.
   */
  @Security("jwt")
  @Post("/")
  public async createBook(
    @Request() request: express.Request,
    @Body() body: CreateBookInput
  ): Promise<BookJSON> {
    return createBook(body);
  }

  /**
   * Update a book. Upload thumbnails at /uploads and add the urls here.
   */
  @Security("jwt")
  @Put("/{bookId}")
  public async updateBook(
    @Request() request: express.Request,
    @Path() bookId: string,
    @Body() updateBody: UpdateBookInput
  ): Promise<BookJSON> {
    return updateBook(bookId, updateBody);
  }
  /**
   * Delete
   */
  @Security("jwt")
  @Delete("/{bookId}")
  public async deleteBook(
    @Request() request: express.Request,
    @Path() bookId: string
  ): Promise<DeleteResult<BookJSON>> {
    const book = await BookModel.findByIdAndDelete(bookId);
    if (!book) {
      throw new NotFoundException(`Cannot find Book with id ${bookId}`);
    }
    return {
      deleted: await book.jsonify(),
    };
  }
}
