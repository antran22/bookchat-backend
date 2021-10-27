import { BookModel } from "@/models/Book";

export async function deleteBook(bookId?: string) {
  if (bookId) {
    return BookModel.findByIdAndDelete(bookId);
  } else {
    return BookModel.deleteOne();
  }
}
