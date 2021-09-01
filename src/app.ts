import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
// npm run tsoa routes first to build this path
import { RegisterRoutes } from "./generated/routes";
import morgan from "morgan";
import { mongoose } from "@typegoose/typegoose";

export const app = express();

// Use body parser to read sent json payloads
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use("/_docs", swaggerUi.serve, async (req: Request, res: Response) => {
  return res.send(
    swaggerUi.generateHTML(await import("./documentations/swagger.json"))
  );
});

RegisterRoutes(app);

const port = process.env.PORT || 3000;
const databaseUrl =
  process.env.MONGO_URL || "mongodb://localhost:27017/bookchat";

mongoose
  .connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to database at ${databaseUrl}`);
    app.listen(port, () =>
      console.log(`Example app listening at http://localhost:${port}`)
    );
  });
