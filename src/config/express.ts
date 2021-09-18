import express from "express";
import bodyParser from "body-parser";
import expressPino from "express-pino-logger";
import { env, expressLogger } from "@/utils";
import swaggerUi from "swagger-ui-express";

// npm run tsoa routes first to build this path
import { RegisterRoutes } from "@/generated/routes";
import errorHandler from "@/controllers/_ErrorHandler";

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
    swaggerUi.generateHTML(await import("../documentations/swagger.json"))
  );
};
app.use("/_docs", swaggerUi.serve, swaggerLogHandler);
app.use("/_uploads", express.static("_uploads"));

RegisterRoutes(app);

app.use(errorHandler);

export async function startExpressServer() {
  const apiPort = env.int("API_PORT", 3000);
  const apiHost = env("API_HOST", "0.0.0.0");

  return new Promise<void>((resolve) => {
    app.listen(apiPort, apiHost, () => {
      expressLogger.info(`Server listening at http://${apiHost}:${apiPort}`);
      resolve();
    });
  });
}
