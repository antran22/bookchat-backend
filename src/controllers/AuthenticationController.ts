import {
  Body,
  Controller,
  Get,
  Post,
  Response,
  Query,
  Route,
  SuccessResponse,
  Tags,
} from "@tsoa/runtime";
import { UnauthorizedException } from "@/utils/exceptions";
import {
  authenticateWithGoogle,
  AuthenticationResult,
  getGoogleAuthenticationUrl,
  localAuthentication,
  LocalAuthenticationInput,
} from "@/services/Authentication";
import { SanitisedUser, UserCreationInput, UserModel } from "@/models/User";

@Tags("Authentication")
@Route("auth")
export class AuthenticationController extends Controller {
  @Post("/local")
  @SuccessResponse("200", "Authentication success")
  @Response("401", "Wrong credential")
  public async localAuthentication(
    @Body() requestBody: LocalAuthenticationInput
  ): Promise<AuthenticationResult> {
    const result = await localAuthentication(requestBody);
    if (result) {
      return result;
    }
    throw new UnauthorizedException("Wrong credential");
  }

  @SuccessResponse("200", "Created") // Custom success response
  @Response("400", "Invalid Input")
  @Post()
  public async localSignUp(
    @Body() requestBody: LocalSignUpInput
  ): Promise<SanitisedUser> {
    const user = await UserModel.createUser(requestBody);
    this.setStatus(201);
    return user.sanitise();
  }

  @Get("/google")
  public getGoogleAuthUrl(): { url: string } {
    // Todo: Implement PCKE here
    return {
      url: getGoogleAuthenticationUrl(),
    };
  }

  @Get("/google/callback")
  public async handleAuthenticateWithGoogle(
    @Query() code: string,
    @Query() state?: string
  ): Promise<AuthenticationResult> {
    return authenticateWithGoogle({ code, state });
  }
}

/**
 * The fields required to sign up using local method
 */
type LocalSignUpInput = Required<UserCreationInput>;
