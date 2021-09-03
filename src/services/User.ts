import { User, UserModel } from "@/models/User";
import jwt from "jsonwebtoken";
import { env, logger } from "@/utils";

const userServiceLogger = logger.child({ module: "userService" });

export type UserCreationInput = Pick<
  User,
  "username" | "password" | "fullName" | "email" | "gender" | "dateOfBirth"
>;

export async function createUser(
  userCreationInput: UserCreationInput
): Promise<User> {
  userServiceLogger.info({ userCreationInput }, `Creating new User`);
  return UserModel.create(userCreationInput);
}

export interface LoginInput {
  usernameOrEmail: string;
  password: string;
}

export async function loginUser(loginInput: LoginInput): Promise<User | null> {
  userServiceLogger.info({ loginInput }, `User logging`);
  const user = await UserModel.findOne({
    $or: [
      { username: loginInput.usernameOrEmail },
      { email: loginInput.usernameOrEmail },
    ],
  }).exec();

  if (!user) {
    userServiceLogger.warn(`No such user found with input ${loginInput}`);
    return null;
  }

  if (await user.isPasswordValid(loginInput.password)) {
    return user;
  }

  return null;
}

interface AppJWTPayload {
  userId: string;
  accessScope: string[];
}

const jwtSecret = env("JWT_SECRET");
const jwtExpiry = env("JWT_EXPIRY", "1w");

export function signAccessToken(user: User): string {
  const payload: AppJWTPayload = {
    userId: user._id.toString(),
    accessScope: user.accessScope,
  };

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
}

export async function decodeJWTToken(
  jwtToken: string
): Promise<AppJWTPayload | null> {
  try {
    return jwt.verify(jwtToken, jwtSecret) as AppJWTPayload;
  } catch (e) {
    console.error(e);
    return null;
  }
}
