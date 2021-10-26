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
  UploadedFile,
} from "@tsoa/runtime";
import {
  User,
  UserJSON,
  UserModel,
  UserProfileUpdateInput,
} from "@/models/User";
import type express from "express";
import { BadRequestException, NotFoundException } from "@/utils/exceptions";
import { multerFileHaveMatchingMimeType, multerFileToStaticUrl } from "@/utils";
import type { DeleteResult, Listing } from "../_ControllerUtils";
import { wrapListingResult } from "../_ControllerUtils";
import { listUser } from "@/services/User";

@Tags("User")
@Route("users")
export class UsersController {
  /**
   * List out all the users on the site. Call without cursor to start listing.
   * Call the nextUrl field in the response to fetch the next page.
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 users at once
   */
  @Get("/")
  public async list(
    @Request() request: express.Request,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<UserJSON>> {
    const users = await listUser({ limit, cursor });
    const userJSONs = await User.jsonifyAll(users);
    return wrapListingResult(userJSONs, request);
  }

  /**
   * Get the personal user profile
   */
  @Security("jwt")
  @Get("me")
  public async getPersonalProfile(
    @Request() request: express.Request
  ): Promise<UserJSON> {
    return request.user.jsonify();
  }

  /**
   * Update the personal user profile
   */
  @Security("jwt")
  @Put("me")
  public async updatePersonalProfile(
    @Request() request: express.Request,
    @Body() input: UserProfileUpdateInput
  ): Promise<UserJSON> {
    await request.user.profileUpdate(input);
    return request.user.jsonify();
  }

  /**
   * Delete your personal profile
   */
  @Security("jwt")
  @Delete("me")
  public async deletePersonalAccount(
    @Request() request: express.Request
  ): Promise<DeleteResult<UserJSON>> {
    const sanitisedUserRecord = await request.user.jsonify();
    await request.user.delete();
    return {
      deleted: sanitisedUserRecord,
    };
  }

  /**
   * Upload personal profile picture
   */
  @Security("jwt")
  @Post("me/avatar")
  public async updatePersonalProfilePicture(
    @Request() request: express.Request,
    @UploadedFile() avatar: Express.Multer.File
  ): Promise<UserJSON> {
    if (!multerFileHaveMatchingMimeType(avatar, "image/.*")) {
      throw new BadRequestException(
        "Invalid file type for field avatar, expecting image/*"
      );
    }
    request.user.avatar = await multerFileToStaticUrl(avatar);
    await request.user.save();
    return request.user.jsonify();
  }

  /**
   * Call to get any other user profile.
   * @param id
   */
  @Get("{id}")
  public async get(@Path() id: string): Promise<UserJSON> {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Cannot find an user with such ID`);
    }
    return user.jsonify();
  }
}
