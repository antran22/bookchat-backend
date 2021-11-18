import { Command } from "commander";
import { initialiseFirebaseApp } from "@/config/firebase";
import {
  connectMongooseToMongoDB,
  disconnectMongoose,
} from "@/config/mongoose";
import { importBookFromCSVFile } from "@/commands/importBook";
import { createTestUser } from "@/commands/createUser";
import { deleteBook } from "@/commands/deleteBook";
import jwt from "jsonwebtoken";
import { env } from "@/utils";

const program = new Command();
program.version("0.0.1");
program.command("import_book <csvfile>").action(async (csvfile) => {
  await initCLI();
  await importBookFromCSVFile(csvfile);
  await deinitCLI();
});

program.command("create_user <displayName>").action(async (displayName) => {
  await initCLI();
  await createTestUser(displayName);
  await deinitCLI();
});

program.command("delete_book [bookId]").action(async (bookId) => {
  await initCLI();
  await deleteBook(bookId);
  await deinitCLI();
});

program.command("sign_access_token <userId>").action(async (userId) => {
  const jwtSecret = env("JWT_SECRET");
  const jwtExpiry = env("JWT_EXPIRY", "1w");

  const payload = {
    userId,
  };
  console.log(
    "JWT Token",
    jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry })
  );
});

program.parse(process.argv);

async function initCLI() {
  initialiseFirebaseApp();
  await connectMongooseToMongoDB();
}

async function deinitCLI() {
  await disconnectMongoose();
}
