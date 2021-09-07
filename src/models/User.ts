import { requiredProp } from "@/utils/typegoose";
import {
  DocumentType,
  getModelForClass,
  pre,
  prop,
  ReturnModelType,
} from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import _ from "lodash";
import { logger } from "@/utils";
import { DatabaseModel } from "./_BaseModel";
import { Types } from "mongoose";

const userModelLogger = logger.child({ module: "userModel" });

@pre<User>("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      // noinspection JSPotentiallyInvalidUsageOfClassThis
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error: any) {
      next(error);
    }
  }
  return next();
})
export class User extends DatabaseModel {
  @requiredProp({ unique: true })
  email!: string;

  @requiredProp()
  fullName!: string;

  @prop({ default: "" })
  password!: string;

  @prop({ default: [], type: () => [String] })
  accessScope!: string[];

  @prop({ default: "other" })
  gender!: string;

  @prop()
  avatar?: string;

  @prop()
  bio?: string;

  @prop()
  dateOfBirth?: Date;

  public async isPasswordValid(
    this: DocumentType<User>,
    passwordForValidation: string
  ): Promise<boolean> {
    return bcrypt.compare(passwordForValidation, this.password);
  }

  sanitise(): SanitisedUser {
    return _.omit(this.toJSON(), "password", "accessScope", "updatedAt", "__v");
  }

  static async createUser(input: UserCreationInput): Promise<User> {
    userModelLogger.info({ input }, `Creating new User`);
    return UserModel.create(input);
  }

  static async getUserOrCreateNew(
    input: UserCreationInput
  ): Promise<{ user: User; isNew: boolean }> {
    userModelLogger.info(
      { input },
      `Looking for user with given creation input.`
    );
    const user = await UserModel.findOne().where("email", input.email).exec();
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
export interface UserCreationInput {
  email: string;
  fullName: string;
  password?: string;
  gender?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date;
}
export type SanitisedUser = Omit<
  User,
  "password" | "accessScope" | "updatedAt" | "__v"
>;

export const UserModel = getModelForClass(User);
