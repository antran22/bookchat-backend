import {
  GroupMembershipJSON,
  GroupMembershipModel,
  MembershipPrivilege,
} from "@/models/Group/GroupMembership";
import { ForbiddenException, NotFoundException } from "@/utils";
import { User } from "@/models/User";
import { ListOptions } from "@/models/_BaseModel";

export interface GroupMembershipListOptions extends ListOptions {
  privilege?: MembershipPrivilege;
}

export async function listMembershipOfGroup(
  groupId: string,
  listOptions: GroupMembershipListOptions
): Promise<GroupMembershipJSON[]> {
  let query = GroupMembershipModel.listByCursor(listOptions).where(
    "group",
    groupId
  );
  if (listOptions.privilege) {
    query = query.where("privilege", listOptions.privilege);
  }

  const memberships = await query.exec();

  return GroupMembershipModel.jsonifyAll(memberships);
}

export async function addUserToGroup(
  userId: string,
  groupId: string,
  privilege: MembershipPrivilege
): Promise<GroupMembershipJSON> {
  const membership = await GroupMembershipModel.create({
    user: userId,
    group: groupId,
    privilege: privilege,
  });
  return membership.jsonify();
}

export async function updateMemberPrivilege(
  userId: string,
  groupId: string,
  privilege: MembershipPrivilege
) {
  const membership = await GroupMembershipModel.findOneAndUpdate({
    user: userId,
    group: groupId,
    privilege: privilege,
  }).exec();
  if (!membership) {
    throw new NotFoundException(
      `User ${userId} hasn't joined group ${groupId}`
    );
  }

  return membership.jsonify();
}

export async function removeMemberFromGroup(userId: string, groupId: string) {
  const membership = await GroupMembershipModel.findOneAndDelete({
    user: userId,
    group: groupId,
  }).exec();

  if (!membership) {
    throw new NotFoundException(
      `User ${userId} hasn't joined group ${groupId}`
    );
  }

  return membership.jsonify();
}

export async function assertUserIsGroupMember(
  user: User,
  groupId: string
): Promise<void> {
  const hasGroupMembership = await GroupMembershipModel.exists({
    user: user._id,
    group: groupId,
  });
  if (!hasGroupMembership) {
    throw new ForbiddenException(`You are not member of group ${groupId}`);
  }
}

export async function assertUserIsGroupAdmin(
  user: User,
  groupId: string
): Promise<void> {
  const hasAdminPrivilege = await GroupMembershipModel.exists({
    user: user._id,
    group: groupId,
    privilege: MembershipPrivilege.ADMIN,
  });

  if (!hasAdminPrivilege) {
    throw new ForbiddenException(`You are not admin of group ${groupId}`);
  }
}

export async function deleteAllMembershipFromGroup(groupId: string) {
  return GroupMembershipModel.deleteMany({ group: groupId }).exec();
}
