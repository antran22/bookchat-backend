import { requiredProp } from "@/utils/typegoose";
import { getModelForClass, prop } from "@typegoose/typegoose";
import { DatabaseModel } from "../_BaseModel";

export class Group extends DatabaseModel {
  @requiredProp()
  name!: string;

  @requiredProp()
  description!: string;

  @prop()
  thumbnail?: string;

  async jsonify(): Promise<GroupJSON> {
    return {
      _id: this._id.toString(),
      name: this.name,
      description: this.description,
      thumbnail: this.thumbnail,
    };
  }
}

export interface GroupJSON {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
}

export const GroupModel = getModelForClass(Group);
