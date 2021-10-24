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
import { Group, GroupJSON, GroupModel } from "@/models/Group/Group";
import {
  createGroup,
  CreateGroupInput,
  deleteGroup,
  listGroupOfUser,
  updateGroup,
  UpdateGroupInput,
} from "@/services/Group";
import { ModelNotFoundException } from "@/utils";
import express from "express";

@Tags("Group")
@Route("groups")
export class GroupController {
  @Get("/")
  public async listGroup(
    @Request() request: express.Request,
    @Query() limit: number,
    @Query() cursor?: string,
    @Query() userId?: string
  ): Promise<Listing<GroupJSON>> {
    let groupJSONs: GroupJSON[];
    if (userId) {
      groupJSONs = await listGroupOfUser(userId, { cursor, limit });
    } else {
      const groups = await GroupModel.listByCursor({ limit, cursor });
      groupJSONs = await Group.jsonifyAll(groups);
    }

    return wrapListingResult(groupJSONs, request);
  }

  @Get("{groupId}")
  public async getGroup(@Path() groupId: string): Promise<GroupJSON> {
    const group = await GroupModel.findById(groupId).exec();
    if (!group) {
      throw new ModelNotFoundException(GroupModel, groupId);
    }
    return group.jsonify();
  }

  /**
   * Upload the thumbnail at "/uploads" then add the URL in the request body.
   */
  @Security("jwt")
  @Post("/")
  public async createGroup(
    @Request() request: express.Request,
    @Body() body: CreateGroupInput
  ): Promise<GroupJSON> {
    return createGroup(request.user, body);
  }

  /**
   * Upload the thumbnail at "/uploads" then add the URL in the request body.
   */
  @Security("jwt")
  @Put("/{groupId}")
  public async updateGroupInfo(
    @Request() request: express.Request,
    @Path() groupId: string,
    @Body() body: UpdateGroupInput
  ): Promise<GroupJSON> {
    return updateGroup(request.user, groupId, body);
  }

  @Security("jwt")
  @Delete("/{groupId}")
  public async deleteGroup(
    @Request() request: express.Request,
    @Path() groupId: string
  ): Promise<DeleteResult<GroupJSON>> {
    const group = await deleteGroup(request.user, groupId);
    return {
      deleted: group,
    };
  }
}
