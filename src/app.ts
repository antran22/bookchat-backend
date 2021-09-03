import express from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
// npm run tsoa routes first to build this path
import { RegisterRoutes } from "./generated/routes";
import { mongoose } from "@typegoose/typegoose";
import expressPino from "express-pino-logger";
import { env, expressLogger } from "@/utils";
import errorHandler from "@/controllers/errorHandler";

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

RegisterRoutes(app);

app.use(errorHandler);

const apiPort = env.int("API_PORT", 3000);
const apiHost = env("API_HOST", "0.0.0.0");
const databaseUrl = env("MONGO_URL", "mongodb://localhost:27017/bookchat");

mongoose
  .connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    expressLogger.info(`Connected to database at ${databaseUrl}`);
    app.listen(apiPort, apiHost, () =>
      expressLogger.info(`Server listening at http://${apiHost}:${apiPort}`)
    );
  });
