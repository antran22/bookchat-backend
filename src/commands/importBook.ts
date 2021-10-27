import parse from "csv-parse";
import fs from "fs";
import { createBook } from "@/services/Book";

function removeEmptyValue(array: string[]) {
  return array.filter((val) => !!val);
}

function parsePublishDate(dateString: string): Date | undefined {
  if (dateString.length < 4) {
    return undefined;
  }

  if (dateString.length === 4) {
    return new Date(parseInt(dateString));
  }

  if (dateString.length <= 6) {
    const [month, year] = dateString.split("/");
    return new Date(parseInt(year), parseInt(month));
  }
  return undefined;
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
      name: record[1],
      author: record[3],
      translator: record[4],
      publisher: record[5],
      genres: removeEmptyValue(record.slice(6, 11)),
      price: parseNumber(record[11] ?? "0"),
      pageCount: parseNumber(record[12] ?? "0"),
      publishDate: parsePublishDate(record[13]),
      description: record[14] || "<empty>",
    };
    if (!book.name || !book.author) {
      continue;
    }
    try {
      await createBook(book);
    } catch (e) {
      console.log(e);
      console.log(book);
      break;
    }
    console.log("Written book", book.name);
  }
  file.close();
}
