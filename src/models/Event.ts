import { requiredProp } from "@/utils/typegoose";
import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { DatabaseModel } from "@/models/_BaseModel";
import { User, UserJSON } from "@/models/User";

export class Event extends DatabaseModel {
  @requiredProp()
  name!: string;

  @requiredProp({ ref: () => User })
  host!: Ref<User>;

  @requiredProp()
  content!: string;

  @requiredProp()
  date!: Date;

  @prop({ type: () => [String] })
  attachments!: string[];

  async jsonify(): Promise<EventJSON> {
    await this.populateFields(["host"]);

    const hostJSON = await User.jsonifyReferenceField(this.host);

    return {
      _id: this._id.toString(),
      name: this.name,
      host: hostJSON,
      content: this.content,
      attachments: this.attachments,
      date: this.date,
      createdAt: this.createdAt || new Date(),
      updatedAt: this.updatedAt || new Date(),
    };
  }
}

export interface EventJSON {
  _id: string;
  name: string;
  host?: UserJSON;
  content: string;
  attachments: string[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const EventModel = getModelForClass(Event);
