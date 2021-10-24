import { DatabaseModel } from "@/models/_BaseModel";
import { TypegooseModel } from "@/utils/typegoose";

export abstract class HTTPException extends Error {
  statusCode!: number;
  name!: string;
}
export class BadRequestException extends HTTPException {
  statusCode = 400;
  name = "Bad Request";
}

export class UnauthorizedException extends HTTPException {
  statusCode = 401;
  name = "Unauthorized";
}

export class ForbiddenException extends HTTPException {
  statusCode = 403;
  name = "Forbidden";
}

export class NotFoundException extends HTTPException {
  statusCode = 404;
  name = "Not Found";
}

export class ModelNotFoundException<
  T extends DatabaseModel
> extends NotFoundException {
  constructor(model: TypegooseModel<T>, id: any) {
    super(`Cannot find object of type ${model.name} with ID: ${id}`);
  }
}
