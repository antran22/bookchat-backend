import * as firebaseAdmin from "firebase-admin";
import { User, UserModel } from "@/models/User";
import { getModuleLogger } from "@/utils";
import { Types } from "mongoose";

const userServiceLogger = getModuleLogger(__filename);

/**
 * List user using cursor method. Fetch `limit` users with `_id > cursor`.
 * @param limit
 * @param cursor
 */
export async function listUserByCursor(
  limit: number,
  cursor?: string
): Promise<User[]> {
  let query;
  if (cursor) {
    query = UserModel.find({
      _id: {
        $gt: new Types.ObjectId(cursor),
      },
    });
  } else {
    query = UserModel.find();
  }
  return await query.limit(limit).exec();
}

/**
 * This method is used when sign up with Firebase. So far this is the only method of signing up for this API.
 * @param input the Firebase User Record.
 */
export async function createUserFromFirebase(
  input: firebaseAdmin.auth.UserRecord
): Promise<User> {
  userServiceLogger.info({ input }, `Creating new User`);
  const { uid, displayName, photoURL } = input;
  return UserModel.create({
    firebaseId: uid,
    displayName,
    avatar: photoURL,
  });
}

/**
 * This method is used when sign up with Firebase. So far this is the only method of signing up for this API.
 * @param input the Firebase User Record.
 */
export async function getUserOrCreateNew(
  input: firebaseAdmin.auth.UserRecord
): Promise<{ user: User; isNew: boolean }> {
  userServiceLogger.info(
    { input },
    `Looking for user with given creation input.`
  );
  const user = await UserModel.findOne().where("firebaseId", input.uid).exec();
  if (!user) {
    const newUser = await createUserFromFirebase(input);
    return { user: newUser, isNew: true };
  }
  return { user, isNew: false };
}
