import { requiredProp, TypegooseDocument } from "@/utils/typegoose";
import { getModelForClass, index, Ref } from "@typegoose/typegoose";
import { DatabaseModel } from "./_BaseModel";
import { User, UserJSON } from "./User";

@index({ fromUser: 1, toUser: 1 }, { unique: true })
export class Follow extends DatabaseModel {
  @requiredProp({ ref: () => User })
  fromUser!: Ref<User>;

  @requiredProp({ ref: () => User })
  toUser!: Ref<User>;

  async jsonify(this: TypegooseDocument<Follow>): Promise<FollowJSON> {
    await this.populateFields(["fromUser", "toUser"]);

    return {
      _id: this._id.toString(),
      fromUser: await User.jsonifyReferenceField(this.fromUser),
      toUser: await User.jsonifyReferenceField(this.toUser),
    };
  }
}

export interface FollowJSON {
  _id: string;
  fromUser?: UserJSON;
  toUser?: UserJSON;
}

export const FollowModel = getModelForClass(Follow);
