import type {User} from "@/models/User";
import {TypegooseDocument} from "@/utils";

declare module "express" {
  export interface Request {
    user: TypegooseDocument<User>;
  }
}
