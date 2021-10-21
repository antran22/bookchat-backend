import { UserModel } from "@/models/User";
import { random } from "lodash";
import { signAccessToken } from "@/services/Authentication";

export async function createTestUser(displayName: string) {
  const user = await UserModel.create({
    firebaseId: random(10000).toString(),
    displayName,
  });

  console.log("New Token", signAccessToken(user));
}
