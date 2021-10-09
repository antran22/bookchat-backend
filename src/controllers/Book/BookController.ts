import {
  Delete,
  FormField,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
  UploadedFile,
} from "@tsoa/runtime";
import type express from "express";
import {env, getLastID, multerFileToStaticUrl, NotFoundException,} from "@/utils";
import type {DeleteResult, Listing} from "../_ControllerUtils";
import {createBook, listBook, updateBook} from "@/services/Book";
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

    const lastBookId = getLastID(books);

    const nextUrl = lastBookId
      ? env.resolveAPIPath(request.path, {
          cursor: lastBookId,
          limit,
          author,
          translator,
        })
      : undefined;

    return {
      data: books,
      nextUrl,
    };
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
   * Create a book
   */
  @Security("jwt")
  @Post("/")
  public async createBook(
    @Request() request: express.Request,
    @FormField() name: string,
    @FormField() description: string,
    /** Can either be the User._id refers to the author user object or just a name */
    @FormField() author: string,

    /** Can either be the User._id refers to the translator user object or just a name */
    @FormField() translator?: string,
    @FormField() isbn?: string,
    @FormField() publisher?: string,
    @UploadedFile() thumbnail?: Express.Multer.File
  ): Promise<BookJSON> {
    const thumbnailUrl = await multerFileToStaticUrl(thumbnail);
    return createBook({
      name,
      description,
      author,
      translator,
      isbn,
      publisher,
      thumbnail: thumbnailUrl,
    });
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

  /**
   * Update book
   */
  @Security("jwt")
  @Put("/{bookId}")
  public async updateBook(
    @Request() request: express.Request,
    @Path() bookId: string,

    @FormField() name?: string,
    @FormField() description?: string,
    /** Can either be the User._id refers to the author user object or just a name */
    @FormField() author?: string,
    /** Can either be the User._id refers to the translator user object or just a name */
    @FormField() translator?: string,

    @FormField() isbn?: string,
    @FormField() publisher?: string,
    @UploadedFile() thumbnail?: Express.Multer.File
  ): Promise<BookJSON> {
    const thumbnailUrl = await multerFileToStaticUrl(thumbnail);
    return updateBook(bookId, {
      name,
      description,
      author,
      translator,
      isbn,
      publisher,
      thumbnail: thumbnailUrl,
    });
  }
}
