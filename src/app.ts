import { expressLogger } from "@/utils";
import { initialiseFirebaseApp } from "@/config/firebase";
import {
  connectMongooseToMongoDB,
  generateRandomUserTokenForDevelopment,
} from "@/config/mongoose";
import { startExpressServer } from "@/config/express";

expressLogger.info("Connected to Firebase Admin");

(async function () {
  initialiseFirebaseApp();
  await connectMongooseToMongoDB();
  await generateRandomUserTokenForDevelopment();
  await startExpressServer();
})();
