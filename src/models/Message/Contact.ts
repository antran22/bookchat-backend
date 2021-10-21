import { getReferenceIdString, requiredProp } from "@/utils/typegoose";
import { getModelForClass, Ref } from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";
import { User } from "../User";

export class Contact extends DatabaseModel {
  @requiredProp({ ref: () => User })
  user1!: Ref<User>;

  @requiredProp({ ref: () => User })
  user2!: Ref<User>;

  @requiredProp()
  lastTime!: Date;

  async jsonify(): Promise<ContactJSON> {
    const user1Id = getReferenceIdString(this.user1);
    const user2Id = getReferenceIdString(this.user2);

    return {
      _id: this._id.toString(),
      lastTime: this.lastTime,
      user1: user1Id,
      user2: user2Id,
    };
  }
}

export type ContactJSON = {
  _id: string;
  user1: string;
  user2: string;
  lastTime: Date;
};

export const ContactModel = getModelForClass(Contact);
