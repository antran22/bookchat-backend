import { requiredProp, TypegooseDocument } from "@/utils/typegoose";
import { getModelForClass, Ref } from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";
import { User, UserJSON } from "../User";

export class Follow extends DatabaseModel {
  @requiredProp({ ref: () => User })
  follower: Ref<User>;

  @requiredProp({ ref: () => User })
  followedby: Ref<User>;

  async jsonify(
    this: TypegooseDocument<Follow>
  ): Promise<FollowJSON> {
    await this.populateFields(["follower", "followedby"]);
    const followJSON = await User.jsonifyReferenceField(this.follower)
    const followedJSON = await User.jsonifyReferenceField(this.followedby)

    return {
      follower: followJSON,
      followedby: followedJSON,
    };
  }
}

export interface FollowJSON {
  follower?: UserJSON;
  followedby?: UserJSON;
}

export const FollowModel = getModelForClass(Follow);