import parse from "csv-parse";
import fs from "fs";
import { createBook } from "@/services/Book";

function removeEmptyValue(array: string[]) {
  return array.filter((val) => !!val);
}

function parsePublishDate(dateString?: string): Date | undefined {
  if (!dateString) {
    return new Date();
  }
  return new Date(Date.parse(dateString));
}

export function parseNumber(s: string): number {
  const n = parseInt(s);
  if (isNaN(n)) {
    return 0;
  }
  return n;
}

export async function importBookFromCSVFile(csvFile: string) {
  const parser = parse({ skipEmptyLines: true, from: 2 });
  const file = fs.createReadStream(csvFile);
  file.pipe(parser);

  for await (const record of parser) {
    const book = {
      name: record[11],
      author: record[10],
      translator: record[13],
      publisher: record[6],
      genres: removeEmptyValue(record[9]),
      price: parseNumber(record[2] ?? "0"),
      pageCount: parseNumber(record[8] ?? "0"),
      publishDate: parsePublishDate(record[5] ?? ""),
      thumbnail: record[12],
      description: record[7] || "<empty>",
    };
    if (!book.name || !book.author) {
      continue;
    }
    try {
      await createBook(book);
    } catch (e) {
      console.log(e);
      console.log(book);
    }
    console.log("Written book", book.name);
  }
  file.close();
}
