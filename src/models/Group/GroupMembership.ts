import { requiredProp } from "@/utils/typegoose";
import { getModelForClass, index, Ref } from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";
import { User, UserJSON } from "@/models/User";
import { Group, GroupJSON } from "./Group";

export enum MembershipPrivilege {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
}

@index({ user: 1, group: 1 }, { unique: true })
export class GroupMembership extends DatabaseModel {
  @requiredProp({ ref: () => User })
  user!: Ref<User>;

  @requiredProp({ ref: () => Group })
  group!: Ref<Group>;

  @requiredProp({ default: MembershipPrivilege.MEMBER })
  privilege!: MembershipPrivilege;

  async jsonify(): Promise<GroupMembershipJSON> {
    await this.populateFields(["user", "group"]);
    return {
      _id: this._id.toString(),
      user: (await User.jsonifyReferenceField(this.user))!,
      group: (await Group.jsonifyReferenceField(this.group))!,
      privilege: this.privilege,
    };
  }
}

export interface GroupMembershipJSON {
  _id: string;
  user: UserJSON;
  group: GroupJSON;
  privilege: MembershipPrivilege;
}

export const GroupMembershipModel = getModelForClass(GroupMembership);
