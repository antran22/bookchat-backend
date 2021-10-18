import {requiredProp} from "@/utils/typegoose";
import {getModelForClass, Ref} from "@typegoose/typegoose";
import {DatabaseModel} from "../_BaseModel";
import {User, UserJSON} from "../User";

export class Friendship extends DatabaseModel {
  @requiredProp({ ref: () => User })
  user1: Ref<User>;

  @requiredProp({ ref: () => User })
  user2: Ref<User>;

  async jsonify(): Promise<FriendshipJSON> {
    await this.populateFields(["user1", "user2"]);
    return {
      user1: await User.jsonifyReferenceField(this.user1),
      user2: await User.jsonifyReferenceField(this.user2),
    };
  }
}

export interface FriendshipJSON {
  user1?: UserJSON;
  user2?: UserJSON;
}

export const FriendshipModel = getModelForClass(Friendship);
