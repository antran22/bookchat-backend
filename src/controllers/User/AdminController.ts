import {
  Get,
  Path,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "@tsoa/runtime";
import { UserJSON, UserModel } from "@/models/User";
import type express from "express";
import { ModelNotFoundException } from "@/utils/exceptions";
import type { Listing } from "../_ControllerUtils";
import { wrapListingResult } from "../_ControllerUtils";
import { listAdmin } from "@/services/User";

@Tags("Administrators")
@Route("admins")
export class AdminController {
  /**
   * List out all the admins on the site. Call without cursor to start listing.
   * Call the nextUrl field in the response to fetch the next page.
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 users at once
   */
  @Get("/")
  @Security("jwt", ["admin"])
  public async list(
    @Request() request: express.Request,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<UserJSON>> {
    const userJSONs = await listAdmin({ limit, cursor });
    return wrapListingResult(userJSONs, request);
  }

  /**
   * Update the user privilege
   */
  @Security("jwt", ["admin"])
  @Put("{userId}/privilege")
  public async updateUserPrivilege(
    @Request() request: express.Request,
    @Path() userId: string,
    @Query() isAdmin: boolean
  ): Promise<UserJSON> {
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      throw new ModelNotFoundException(UserModel, userId);
    }
    user.isAdmin = isAdmin;
    await user.save();
    return user.jsonify();
  }
}
