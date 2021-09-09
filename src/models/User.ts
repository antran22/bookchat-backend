import { requiredProp } from "@/utils/typegoose";
import { getModelForClass, prop, ReturnModelType } from "@typegoose/typegoose";
import _ from "lodash";
import { logger } from "@/utils";
import { DatabaseModel } from "./_BaseModel";
import { Types } from "mongoose";
import type * as firebaseAdmin from "firebase-admin";

const userModelLogger = logger.child({ module: "userModel" });

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

  sanitise(): SanitisedUser {
    return _.omit(this.toJSON(), "password", "accessScope", "updatedAt", "__v");
  }

  static async createUser(input: firebaseAdmin.auth.UserRecord): Promise<User> {
    userModelLogger.info({ input }, `Creating new User`);
    const { uid, displayName, photoURL } = input;
    return UserModel.create({
      firebaseId: uid,
      displayName,
      avatar: photoURL,
    });
  }

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
      const newUser = await UserModel.createUser(input);
      return { user: newUser, isNew: true };
    }
    return { user, isNew: false };
  }

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
}

export type SanitisedUser = Omit<User, "firebaseId" | "updatedAt" | "__v">;

export const UserModel = getModelForClass(User);
