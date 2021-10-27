import { requiredProp, TypegooseDocument } from "@/utils/typegoose";
import { getModelForClass, prop } from "@typegoose/typegoose";
import _ from "lodash";
import { Optional } from "@/utils";
import { DatabaseModel } from "./_BaseModel";

export class User extends DatabaseModel {
  @prop()
  firebaseId?: string;

  @requiredProp()
  displayName!: string;

  @requiredProp({ default: true })
  active!: boolean;

  @prop({ default: "unspecified" })
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
    return {
      _id: this._id.toString(),
      displayName: this.displayName,
      active: this.active,
      gender: this.gender,
      avatar: this.avatar,
      bio: this.bio,
      dateOfBirth: this.dateOfBirth,
    };
  }
}

export type UserProfileUpdateInput = Optional<
  Pick<User, "bio" | "gender" | "dateOfBirth" | "displayName" | "avatar">
>;

export type UserJSON = {
  _id: string;
  active: boolean;
  displayName: string;
  gender: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date;
};

export const UserModel = getModelForClass(User);
