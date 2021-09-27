import { UserModel } from "@/models/User";
import { BookModel } from "@/models/Book";
import { Error } from "mongoose";

describe("The Book Model", () => {
  beforeAll(async () => {
    await UserModel.create({
      firebaseId: "123",
      displayName: "Author",
    });
    await UserModel.create({
      firebaseId: "124",
      displayName: "Translator",
    });
  });

  it("should not be able to create a book without required fields", async () => {
    const promise = BookModel.create({
      description: "bruh",
      publisher: "Kim Dong",
      thumbnail: "http://image.org/1.png",
    });
    await expect(promise).rejects.toThrowError(Error.ValidationError);

    const promise2 = BookModel.create({
      name: "Hello there",
      description: "bruh",
      thumbnail: "http://image.org/1.png",
    });
    await expect(promise2).rejects.toThrowError(Error.ValidationError);
  });

  it("should be able to create a book without author and translator", async () => {
    const book = await BookModel.create({
      name: "Hello there",
      description: "General Kenobi",
      publisher: "Keem Donk",
      isnb: "1234",
    });
    expect(book).toBeInstanceOf(BookModel);
  });

  it("should be able to create a book with a string for author and translator", async () => {
    const creationInput = {
      name: "Hello there",
      description: "General Kenobi",
      publisher: "Keem Donk",
      isnb: "1234",
      author: "Ewan McGregor",
      translator: "An Tran",
    };
    const book = await BookModel.create(creationInput);
    const bookJSON = await book.jsonify();

    expect(book).toBeInstanceOf(BookModel);
    expect(bookJSON).toEqual(creationInput);
  });

  it("should be able to create a book with a given user for author and translator", async () => {
    const author = await UserModel.findOne({ displayName: "Author" }).exec();
    const translator = await UserModel.findOne({
      displayName: "Translator",
    }).exec();

    const creationInput = {
      name: "Hello there",
      description: "General Kenobi",
      publisher: "Keem Donk",
      thumbnail: "https://image.org/2.png",
      isnb: "1234",
    };

    expect(author).not.toBeNull();
    expect(translator).not.toBeNull();

    const book = await BookModel.create({
      ...creationInput,
      author: author!._id,
      translator: translator!._id,
    });
    const bookJSON = await book.jsonify();

    expect(book).toBeInstanceOf(BookModel);
    expect(bookJSON).toEqual({
      ...creationInput,
      author: await author!.jsonify(),
      translator: await translator!.jsonify(),
    });
  });
});
