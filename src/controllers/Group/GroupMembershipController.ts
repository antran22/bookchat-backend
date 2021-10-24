import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "@tsoa/runtime";
import {
  DeleteResult,
  Listing,
  wrapListingResult,
} from "@/controllers/_ControllerUtils";
import {
  addUserToGroup,
  assertGroupExistence,
  assertUserIsGroupAdmin,
  listMembershipOfGroup,
  removeMemberFromGroup,
  updateMemberPrivilege,
} from "@/services/Group";
import express from "express";
import { GroupMembershipJSON, MembershipPrivilege } from "@/models/Group";

@Tags("Group Membership")
@Route("groups")
export class GroupMembershipController {
  @Get("{groupId}/members")
  public async listGroupMembership(
    @Request() request: express.Request,
    @Path() groupId: string,
    @Query() limit: number,
    @Query() cursor?: string,
    @Query() privilege?: MembershipPrivilege
  ): Promise<Listing<GroupMembershipJSON>> {
    const members = await listMembershipOfGroup(groupId, {
      limit,
      cursor,
      privilege,
    });

    return wrapListingResult(members, request);
  }

  @Security("jwt")
  @Post("{groupId}/members")
  public async addUserToGroup(
    @Request() request: express.Request,
    @Path() groupId: string,
    @Body() body: { userId: string; privilege: MembershipPrivilege }
  ): Promise<GroupMembershipJSON> {
    await assertGroupExistence(groupId);
    await assertUserIsGroupAdmin(request.user, groupId);
    return addUserToGroup(body.userId, groupId, body.privilege);
  }

  /**
   * Use this route to update an user privilege in this group
   */
  @Security("jwt")
  @Put("{groupId}/members/{userId}")
  public async editMembership(
    @Request() request: express.Request,
    @Path() groupId: string,
    @Path() userId: string,
    @Body() body: { privilege: MembershipPrivilege }
  ): Promise<GroupMembershipJSON> {
    await assertGroupExistence(groupId);
    await assertUserIsGroupAdmin(request.user, groupId);
    return updateMemberPrivilege(userId, groupId, body.privilege);
  }

  @Security("jwt")
  @Delete("/{groupId}/members/{userId}")
  public async removeUserFromGroup(
    @Request() request: express.Request,
    @Path() groupId: string,
    @Path() userId: string
  ): Promise<DeleteResult<GroupMembershipJSON>> {
    const membership = await removeMemberFromGroup(userId, groupId);
    return {
      deleted: membership,
    };
  }
}
