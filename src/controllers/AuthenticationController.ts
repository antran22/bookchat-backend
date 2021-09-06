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
import { UnauthorizedException } from "@/controllers/exceptions";
import {
  authenticateWithGoogle,
  AuthenticationResult,
  getGoogleAuthenticationUrl,
  localAuthentication,
  LocalAuthenticationInput,
} from "@/services/Authentication";

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
