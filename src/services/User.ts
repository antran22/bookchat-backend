import * as firebaseAdmin from "firebase-admin";
import { User, UserModel } from "@/models/User";
import { BadRequestException, getModuleLogger } from "@/utils";
import { Types } from "mongoose";
import { ListOptions } from "@/models/_BaseModel";

const userServiceLogger = getModuleLogger(__filename);

/**
 * List user using cursor method. Fetch `limit` users with `_id > cursor`.
 */
export async function listUserByCursor(options: ListOptions): Promise<User[]> {
  let query;
  if (options.cursor) {
    query = UserModel.find({
      _id: {
        $gt: new Types.ObjectId(options.cursor),
      },
    });
  } else {
    query = UserModel.find();
  }
  return await query.limit(options.limit).exec();
}

/**
 * This method is used when sign up with Firebase. So far this is the only method of signing up for this API.
 * @param input the Firebase User Record.
 */
export async function createUserFromFirebase(
  input: firebaseAdmin.auth.UserRecord
): Promise<User> {
  userServiceLogger.info({ input }, `Creating new User`);
  const { uid, displayName, photoURL, email } = input;
  if (!displayName && !email) {
    throw new BadRequestException(
      "Cannot create new User without Email or DisplayName"
    );
  }
  return UserModel.create({
    firebaseId: uid,
    displayName: displayName ?? email,
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

export async function getUsersWithIds(ids: string[]): Promise<User[]> {
  return UserModel.find().where("_id").in(ids).exec();
}
