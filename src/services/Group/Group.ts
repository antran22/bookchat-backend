import { User } from "@/models/User";
import {
  addUserToGroup,
  assertUserIsGroupAdmin,
  deleteAllMembershipFromGroup,
} from "@/services/Group/GroupMembership";
import {
  Group,
  GroupJSON,
  GroupMembershipModel,
  GroupModel,
  MembershipPrivilege,
} from "@/models/Group";
import { ModelNotFoundException, Optional } from "@/utils";
import { ListOptions } from "@/models/_BaseModel";
import { Types } from "mongoose";

export async function assertGroupExistence(groupId: string): Promise<void> {
  const groupExist = await GroupModel.exists({ _id: groupId });
  if (!groupExist) {
    throw new ModelNotFoundException(GroupModel, groupId);
  }
}

export async function listGroupOfUser(
  userId: string,
  options: ListOptions
): Promise<GroupJSON[]> {
  const memberships = await GroupMembershipModel.listByCursor(options).exec();
  const groupIds = memberships.map(
    (membership) => membership.group as Types.ObjectId
  );
  const groups = await GroupModel.findByMultipleIds(groupIds);
  return Group.jsonifyAll(groups);
}

export interface CreateGroupInput {
  name: string;
  description: string;
  thumbnail?: string;
}

export async function createGroup(creator: User, input: CreateGroupInput) {
  const group = await GroupModel.create(input);
  await addUserToGroup(
    creator._id.toString(),
    group._id.toString(),
    MembershipPrivilege.ADMIN
  );
  return group.jsonify();
}

export type UpdateGroupInput = Optional<CreateGroupInput>;

export async function updateGroup(
  groupAdmin: User,
  groupId: string,
  input: UpdateGroupInput
) {
  const group = await GroupModel.findOneAndUpdate(
    {
      _id: groupId,
    },
    input,
    {
      new: true,
    }
  ).exec();
  if (!group) {
    throw new ModelNotFoundException(GroupModel, groupId);
  }
  return group.jsonify();
}

export async function deleteGroup(
  groupAdmin: User,
  groupId: string
): Promise<GroupJSON> {
  await assertUserIsGroupAdmin(groupAdmin, groupId);

  const group = await GroupModel.findOneAndDelete({ _id: groupId }).exec();
  if (!group) {
    throw new ModelNotFoundException(GroupModel, groupId);
  }

  await deleteAllMembershipFromGroup(groupId);

  return group.jsonify();
}
