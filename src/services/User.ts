import * as firebaseAdmin from "firebase-admin";
import { User, UserJSON, UserModel } from "@/models/User";
import {
  BadRequestException,
  getModuleLogger,
  ModelNotFoundException,
} from "@/utils";
import { ListOptions } from "@/models/_BaseModel";
import _ from "lodash";

const userServiceLogger = getModuleLogger(__filename);

export interface UserListOptions extends ListOptions {
  active?: boolean;
}
/**
 * List user using cursor method. Fetch `limit` users with `_id > cursor`.
 */
export async function listUser(options: UserListOptions): Promise<User[]> {
  return UserModel.listByCursor(options)
    .where(_.omit(options, "limit", "cursor"))
    .exec();
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
export async function getUserOrCreateNewFromFirebase(
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

export function mapUserIdToRecords(
  userRecords: UserJSON[]
): Record<string, UserJSON> {
  const userIdToRecordMapping: Record<string, UserJSON> = {};

  userRecords.forEach((record) => {
    userIdToRecordMapping[record._id] = record;
  });

  return userIdToRecordMapping;
}

export async function listAdmin(listOptions: ListOptions): Promise<UserJSON[]> {
  const admins = await UserModel.listByCursor(listOptions)
    .where("isAdmin", true)
    .exec();
  return User.jsonifyAll(admins);
}

export async function setUserPrivilege(
  userId: string,
  isAdmin: boolean
): Promise<UserJSON> {
  const user = await UserModel.findById(userId).exec();
  if (!user) {
    throw new ModelNotFoundException(UserModel, userId);
  }
  user.isAdmin = isAdmin;
  await user.save();
  return user.jsonify();
}
