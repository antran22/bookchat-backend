import { requiredProp, TypegooseDocument } from "@/utils/typegoose";
import { getModelForClass, Ref } from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";
import { User, UserJSON } from "../User";

export class Follow extends DatabaseModel {
  @requiredProp({ ref: () => User })
  follower: Ref<User>;

  @requiredProp({ ref: () => User })
  followee: Ref<User>;

  async jsonify(
    this: TypegooseDocument<Follow>
  ): Promise<FollowJSON> {
    await this.populateFields(["follower", "followee"]);
    const followJSON = await User.jsonifyReferenceField(this.follower)
    const followedJSON = await User.jsonifyReferenceField(this.followee)

    return {
      follower: followJSON,
      followee: followedJSON,
    };
  }
}

export interface FollowJSON {
  follower?: UserJSON;
  followee?: UserJSON;
}

export const FollowModel = getModelForClass(Follow);
