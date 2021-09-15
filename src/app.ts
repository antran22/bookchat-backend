import express from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
// npm run tsoa routes first to build this path
import { RegisterRoutes } from "./generated/routes";
import { mongoose } from "@typegoose/typegoose";
import expressPino from "express-pino-logger";
import { env, expressLogger, NodeEnv } from "@/utils";
import errorHandler from "@/controllers/_ErrorHandler";
import * as firebase from "firebase-admin";
import { UserModel } from "@/models/User";
import { signAccessToken } from "@/services/Authentication";

export const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(
  expressPino({
    logger: expressLogger,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        user: req.raw.user?.username,
      }),
    },
  })
);

const swaggerLogHandler: express.Handler = async (req, res) => {
  return res.send(
    swaggerUi.generateHTML(await import("./documentations/swagger.json"))
  );
};
app.use("/_docs", swaggerUi.serve, swaggerLogHandler);
app.use("/_uploads", express.static("_uploads"));

RegisterRoutes(app);

app.use(errorHandler);

const apiPort = env.int("API_PORT", 3000);
const apiHost = env("API_HOST", "0.0.0.0");
const databaseUrl = env("MONGO_URL", "mongodb://localhost:27017/bookchat");

firebase.initializeApp({
  // @ts-ignore
  credential: firebase.credential.cert("firebaseServiceAccount.json"),
});
expressLogger.info("Connected to Firebase Admin");

(async function () {
  await mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  expressLogger.info(`Connected to database at ${databaseUrl}`);
  app.listen(apiPort, apiHost, () =>
    expressLogger.info(`Server listening at http://${apiHost}:${apiPort}`)
  );

  if (env.isNodeEnv(NodeEnv.DEVELOPMENT)) {
    const testUser = await UserModel.findOne().exec();
    if (testUser) {
      console.log("Test user Access Token: ", signAccessToken(testUser));
    }
  }

  // await UserModel.create({
  //   firebaseId: "1",
  //   displayName: "An",
  //   gender: "Helicopter",
  //   dateOfBirth: new Date("2001/2/22"),
  // });
  // await UserModel.create({
  //   firebaseId: "2",
  //   displayName: "Binh",
  //   gender: "Abram Tank",
  //   dateOfBirth: new Date("2001/2/23"),
  // });
})();
