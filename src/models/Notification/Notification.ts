import {requiredProp} from "@/utils/typegoose";
import {getModelForClass, index, prop, Ref} from "@typegoose/typegoose";
import {DatabaseModel} from "../_BaseModel";
import {User} from "../User";
import {NotificationType} from "@/models/Notification/NotificationType";

@index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }) // 1 week expiration
export class Notification extends DatabaseModel {
  @prop({ ref: () => User })
  owner?: Ref<User>;

  @requiredProp()
  type!: NotificationType;

  @requiredProp()
  payload!: object;

  async jsonify(): Promise<NotificationJSON> {
    return {
      type: NotificationType[this.type],
      payload: this.payload,
    };
  }
}

export interface NotificationJSON {
  type: string;
  payload: object;
}

export const NotificationModel = getModelForClass(Notification);
