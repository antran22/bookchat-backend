import express from "express";
import bodyParser from "body-parser";
import expressPino from "express-pino-logger";
import {enumKeyList, env, expressLogger} from "@/utils";
import swaggerUi from "swagger-ui-express";

// npm run tsoa routes first to build this path
import {RegisterRoutes} from "@/generated/routes";
import errorHandler from "@/controllers/_ErrorHandler";
import http from "http";
import {LiveEventServer} from "@/services/Notification";
import fs from "fs";
import {UserModel} from "@/models/User";
import {signAccessToken} from "@/services/Authentication";
import {EventType, NotificationType} from "@/models/Notification";

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

app.get("/_ws", async (req, res) => {
  const file = fs.readFileSync(env.projectPath("docs/websocket.html"));
  const htmlString = file.toString();
  const user = await UserModel.findOne().exec();
  const accessToken = signAccessToken(user!);

  const events = [...enumKeyList(EventType), ...enumKeyList(NotificationType)];

  const substitutedHTMLString = htmlString
    .replace("$ACCESS_TOKEN", accessToken)
    .replace("$EVENT_LIST", events.map((event) => `"${event}"`).join(","));

  res.send(substitutedHTMLString);
});

app.use("/_uploads", express.static("_uploads"));

RegisterRoutes(app);

app.use(errorHandler);

export async function startExpressServer() {
  const apiPort = env.int("API_PORT", 3000);
  const apiHost = env("API_HOST", "0.0.0.0");

  const httpServer = http.createServer(app);
  LiveEventServer.connect(httpServer);

  return new Promise<void>((resolve) => {
    httpServer.listen(apiPort, apiHost, () => {
      expressLogger.info(`Server listening at http://${apiHost}:${apiPort}`);
      resolve();
    });
  });
}
