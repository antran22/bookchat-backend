import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from "@tsoa/runtime";
import { SanitisedUser, UserCreationInput, UserModel } from "@/models/User";
import { NotFoundException } from "./exceptions";
import type express from "express";

@Tags("User")
@Route("users")
export class UsersController extends Controller {
  @Get("/")
  public async listUser(): Promise<SanitisedUser[]> {
    const users = await UserModel.find().exec();
    return users.map((u) => u.sanitise());
  }

  @Security("jwt")
  @Get("me")
  public async getMyInfo(
    @Request() request: express.Request
  ): Promise<SanitisedUser> {
    return request.user.sanitise();
  }

  @Get("{userId}")
  public async getUser(@Path() userId: string): Promise<SanitisedUser> {
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("Cannot find user with such ID");
    }
    return user.sanitise();
  }

  @SuccessResponse("200", "Created") // Custom success response
  @Response("400", "Invalid Input")
  @Post()
  public async createUser(
    @Body() requestBody: UserCreationInput
  ): Promise<SanitisedUser> {
    const user = await UserModel.createUser(requestBody);
    this.setStatus(201);
    return user.sanitise();
  }
}
