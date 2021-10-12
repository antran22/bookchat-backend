import {MongoMemoryServer} from "mongodb-memory-server";
import {mongoose} from "@typegoose/typegoose";

beforeAll(async () => {
  const server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri(), {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
});
