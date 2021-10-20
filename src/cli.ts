import { Command } from "commander";
import { initialiseFirebaseApp } from "@/config/firebase";
import {
  connectMongooseToMongoDB,
  disconnectMongoose,
} from "@/config/mongoose";
import { importBookFromCSVFile } from "@/commands/importBook";

const program = new Command();
program.version("0.0.1");
program
  .command("import_book <csvfile>")
  .action(async (csvfile, options, command) => {
    await initCLI();
    await importBookFromCSVFile(csvfile);
    await deinitCLI();
  });
program.parse(process.argv);
async function initCLI() {
  initialiseFirebaseApp();
  await connectMongooseToMongoDB();
}

async function deinitCLI() {
  await disconnectMongoose();
}
