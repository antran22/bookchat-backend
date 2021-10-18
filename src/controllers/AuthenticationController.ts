import {Controller, Get, Query, Route, Tags} from "@tsoa/runtime";
import {AuthenticationResult} from "@/services/Authentication";
import {authenticateWithFirebase} from "@/services/Authentication/Firebase";

@Tags("Authentication")
@Route("auth")
export class AuthenticationController extends Controller {
  @Get("/firebase")
  public async authenticateWithFirebase(
    @Query() idToken: string
  ): Promise<AuthenticationResult> {
    return authenticateWithFirebase(idToken);
  }
}
