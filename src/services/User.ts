import { User, UserModel } from "@/models/User";

export type UserCreationInput = Pick<
  User,
  "username" | "password" | "fullName" | "email" | "gender" | "dateOfBirth"
>;

export async function createUser(input: UserCreationInput): Promise<User> {
  return UserModel.create(input);
}

export interface LoginInput {
  usernameOrEmail: string;
  password: string;
}

export async function loginUser(input: LoginInput): Promise<User | null> {
  const user = await UserModel.findOne({
    $or: [
      { username: input.usernameOrEmail },
      { email: input.usernameOrEmail },
    ],
  }).exec();

  if (!user) {
    return null;
  }

  if (await user.isPasswordValid(input.password)) {
    return user;
  }

  return null;
}
