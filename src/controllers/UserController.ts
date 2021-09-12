import {
  Get,
  Put,
  Post,
  Path,
  Body,
  Query,
  Request,
  Route,
  Security,
  Tags,
  UploadedFile,
} from "@tsoa/runtime";
import {
  SanitisedUser,
  UserModel,
  UserProfileUpdateInput,
} from "@/models/User";
import type express from "express";
import { BadRequestException, NotFoundException } from "@/utils/exceptions";
import {
  multerFileHaveMatchingMimeType,
  env,
  saveMulterFileAndGetStaticUrl,
} from "@/utils";

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
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<UserListing> {
    const users = await UserModel.listByCursor(limit, cursor);
    const sanitisedUser = users.map((u) => u.sanitise());
    const lastUserID = sanitisedUser[sanitisedUser.length - 1]._id;
    const nextUrl = env.resolveAPIPath(
      `/users?cursor=${lastUserID}&limit=${limit}`
    );
    return {
      users: sanitisedUser,
      nextUrl,
    };
  }

  /**
   * Get the personal user profile
   */
  @Security("jwt")
  @Get("me")
  public async getPersonalProfile(
    @Request() request: express.Request
  ): Promise<SanitisedUser> {
    return request.user.sanitise();
  }

  /**
   * Update the personal user profile
   */
  @Security("jwt")
  @Put("me")
  public async updatePersonalProfile(
    @Request() request: express.Request,
    @Body() input: UserProfileUpdateInput
  ): Promise<SanitisedUser> {
    await request.user.profileUpdate(input);
    return request.user.sanitise();
  }

  /**
   * Upload personal profile picture
   */
  @Security("jwt")
  @Post("me/avatar")
  public async updatePersonalProfilePicture(
    @Request() request: express.Request,
    @UploadedFile() avatar: Express.Multer.File
  ): Promise<SanitisedUser> {
    if (!multerFileHaveMatchingMimeType(avatar, "image/.*")) {
      throw new BadRequestException(
        "Invalid file type for field avatar, expecting image/*"
      );
    }
    request.user.avatar = saveMulterFileAndGetStaticUrl(avatar);
    await request.user.save();
    return request.user.sanitise();
  }

  /**
   * Call to get any other user profile.
   * @param id
   */
  @Get("{id}")
  public async get(@Path() id: string): Promise<SanitisedUser> {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Cannot find an user with such ID`);
    }
    return user.sanitise();
  }
}

interface UserListing {
  users: SanitisedUser[];
  nextUrl: string;
}
