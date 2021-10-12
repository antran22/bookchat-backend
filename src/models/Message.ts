import {getReferenceIdString, requiredProp} from "@/utils/typegoose";
import {getModelForClass, prop, Ref} from "@typegoose/typegoose";
import {DatabaseModel} from "./_BaseModel";
import {User} from "./User";

export class Message extends DatabaseModel {
  @requiredProp({ ref: () => User })
  sender!: Ref<User>;

  @requiredProp({ default: false })
  revoked!: boolean;

  @requiredProp({ ref: () => User })
  recipient!: Ref<User>;

  @requiredProp()
  content!: string;

  @prop({ type: () => [String] })
  attachments!: string[];

  async jsonify(): Promise<MessageJSON> {
    const senderId = getReferenceIdString(this.sender);
    const recipientId = getReferenceIdString(this.recipient);
    if (this.revoked) {
      return {
        _id: this._id.toString(),
        createdAt: this.createdAt || new Date(),
        sender: senderId,
        recipient: recipientId,
        revoked: true,
      };
    }
    return {
      _id: this._id.toString(),
      createdAt: this.createdAt || new Date(),
      sender: senderId,
      recipient: recipientId,
      content: this.content,
      attachments: this.attachments,
      revoked: false,
    };
  }
}

export type MessageJSON = {
  _id: string;
  createdAt: Date;
  sender: string;
  recipient: string;
  content?: string;
  attachments?: string[];
  revoked: boolean;
};

export const MessageModel = getModelForClass(Message);
