import { DatabaseModel, requiredProp } from "@/utils/typegoose";
import {
  DocumentType,
  getModelForClass,
  pre,
  prop,
} from "@typegoose/typegoose";
import bcrypt from "bcrypt";

@pre<User>("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error: any) {
      next(error);
    }
  }
  return next();
})
export class User extends DatabaseModel {
  @requiredProp()
  username!: string;

  @requiredProp()
  password!: string;

  @requiredProp()
  fullName!: string;

  @requiredProp()
  dateOfBirth!: Date;

  @requiredProp()
  gender!: string;

  @requiredProp()
  email!: string;

  @prop()
  avatar?: string;

  @prop()
  bio?: string;

  public async isPasswordValid(
    this: DocumentType<User>,
    passwordForValidation: string
  ): Promise<boolean> {
    return bcrypt.compare(passwordForValidation, this.password);
  }
}
export const UserModel = getModelForClass(User);
