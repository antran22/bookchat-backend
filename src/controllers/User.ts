import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { User, UserModel } from "@/models/User";
import {
  createUser,
  LoginInput,
  loginUser,
  UserCreationInput,
} from "@/services/User";
import { NotFoundException, UnauthorizedException } from "./exceptions";

@Tags("User")
@Route("users")
export class UsersController extends Controller {
  @Get("/")
  public async listUser(): Promise<User[]> {
    return [];
  }

  @Get("{userId}")
  public async getUser(@Path() userId: string): Promise<User> {
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("Cannot find user with such ID");
    }
    return user;
  }

  @SuccessResponse("201", "Created") // Custom success response
  @Post()
  public async createUser(
    @Body() requestBody: UserCreationInput
  ): Promise<User> {
    const user = await createUser(requestBody);
    this.setStatus(201);
    return user;
  }

  @Post("/login")
  public async login(@Body() requestBody: LoginInput): Promise<string> {
    const user = await loginUser(requestBody);
    if (user) {
      console.log(user);
      return "token";
    }
    throw new UnauthorizedException("Wrong credential");
  }
}
