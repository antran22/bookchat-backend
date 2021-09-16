import {requiredProp, TypegooseDocument} from "@/utils/typegoose";
import { getModelForClass, prop } from "@typegoose/typegoose";
import _ from "lodash";
import { Optional } from "@/utils";
import { DatabaseModel } from "./_BaseModel";

export class User extends DatabaseModel {
  @requiredProp({unique: true})
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

  async profileUpdate(
    this: TypegooseDocument<this>,
    input: UserProfileUpdateInput
  ): Promise<void> {
    _.assign(this, input);
    await this.save();
  }

  async jsonify(): Promise<UserJSON> {
    return _.omit(this.toJSON(), "firebaseId", "updatedAt", "__v");
  }
}

export type UserProfileUpdateInput = Optional<
  Pick<User, "bio" | "gender" | "dateOfBirth" | "displayName" | "avatar">
>;

export type UserJSON = Omit<User, "firebaseId" | "updatedAt" | "__v">;

export const UserModel = getModelForClass(User);
