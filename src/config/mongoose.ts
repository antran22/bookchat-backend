import {mongoose} from "@typegoose/typegoose";
import {env, getModuleLogger, NodeEnv} from "@/utils";
import {UserModel} from "@/models/User";
import {signAccessToken} from "@/services/Authentication";

const logger = getModuleLogger(__filename);

export async function connectMongooseToMongoDB() {
  const databaseUrl: string = env("MONGO_URL", "mongodb://localhost:27017/bookchat");

  await mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  logger.info(`Connected to database at ${databaseUrl}`);
}

export async function generateRandomUserTokenForDevelopment() {
  if (env.isNodeEnv(NodeEnv.DEVELOPMENT)) {
    const testUser = await UserModel.findOne().exec();
    if (testUser) {
      console.log("Test user Access Token: ", signAccessToken(testUser));
    }
  }
}
