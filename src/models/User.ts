import { requiredProp, TypegooseDocument } from "@/utils/typegoose";
import { getModelForClass, prop, ReturnModelType } from "@typegoose/typegoose";
import _ from "lodash";
import { getModuleLogger, Optional } from "@/utils";
import { DatabaseModel } from "./_BaseModel";
import { Types } from "mongoose";
import type * as firebaseAdmin from "firebase-admin";

const userModelLogger = getModuleLogger(__filename);

export class User extends DatabaseModel {
  @requiredProp()
  firebaseId!: string;

  @requiredProp()
  displayName!: string;

  @prop({ default: "other" })
  gender!: string;

  @prop()
  avatar?: string;

  @prop()
  bio?: string;

  @prop()
  dateOfBirth?: Date;

  /**
   * This method is used when sign up with Firebase. So far this is the only method of signing up for this API.
   * @param input the Firebase User Record.
   */
  static async createUserFromFirebase(
    input: firebaseAdmin.auth.UserRecord
  ): Promise<User> {
    userModelLogger.info({ input }, `Creating new User`);
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
  static async getUserOrCreateNew(
    input: firebaseAdmin.auth.UserRecord
  ): Promise<{ user: User; isNew: boolean }> {
    userModelLogger.info(
      { input },
      `Looking for user with given creation input.`
    );
    const user = await UserModel.findOne()
      .where("firebaseId", input.uid)
      .exec();
    if (!user) {
      const newUser = await UserModel.createUserFromFirebase(input);
      return { user: newUser, isNew: true };
    }
    return { user, isNew: false };
  }

  /**
   * List user using cursor method. Fetch `limit` users with `_id > cursor`.
   * @param limit
   * @param cursor
   */
  static async listByCursor(
    this: ReturnModelType<typeof User>,
    limit: number,
    cursor?: string
  ): Promise<User[]> {
    let query;
    if (cursor) {
      query = this.find({
        _id: {
          $gt: new Types.ObjectId(cursor),
        },
      });
    } else {
      query = this.find();
    }
    return await query.limit(limit).exec();
  }

  async profileUpdate(
    this: TypegooseDocument<this>,
    input: UserProfileUpdateInput
  ): Promise<void> {
    _.assign(this, input);
    await this.save();
  }

  sanitise(): SanitisedUser {
    return _.omit(this.toJSON(), "firebaseId", "updatedAt", "__v");
  }
}

export type UserProfileUpdateInput = Optional<
  Pick<User, "bio" | "gender" | "dateOfBirth" | "displayName" | "avatar">
>;

export type SanitisedUser = Omit<User, "firebaseId" | "updatedAt" | "__v">;

export const UserModel = getModelForClass(User);
