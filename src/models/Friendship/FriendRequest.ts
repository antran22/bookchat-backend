import { requiredProp, TypegooseDocument } from "@/utils/typegoose";
import { getModelForClass, Ref } from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";
import { User, UserJSON } from "../User";

export class FriendRequest extends DatabaseModel {
  @requiredProp({ ref: () => User })
  sender: Ref<User>;

  @requiredProp({ ref: () => User })
  recipient: Ref<User>;

  async jsonify(this: TypegooseDocument<FriendRequest>): Promise<FriendRequestJSON> {
    await this.populateFields(["sender", "recipient"]);
    return {
      sender: await User.jsonifyReferenceField(this.sender),
      recipient: await User.jsonifyReferenceField(this.recipient),
    };
  }
}

export interface FriendRequestJSON {
  sender?: UserJSON;
  recipient?: UserJSON;
}

export const FriendRequestModel = getModelForClass(FriendRequest);
