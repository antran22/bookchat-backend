import { Message, MessageJSON, MessageModel } from "@/models/Message/Message";
import { User, UserModel } from "@/models/User";
import { multipleMulterFilesToStaticUrls, NotFoundException } from "@/utils";
import { ListOptions } from "@/models/_BaseModel";
import {
  notifyUnreadMessage,
  signalNewMessage,
  signalRevokedMessage,
} from "@/services/Notification";

async function lastMessageTime(
  senderId: string,
  recipientId: string
): Promise<Date> {
  const message = await MessageModel.findOne()
    .where("sender", senderId)
    .where("recipient", recipientId)
    .sort({ createdAt: -1 })
    .exec();
  if (!message) {
    return new Date(0);
  }

  return message.createdAt!;
}

export async function createMessage(
  sender: User,
  recipientId: string,
  input: CreateMessageInput
): Promise<MessageJSON> {
  if (!(await UserModel.exists({ _id: recipientId }))) {
    throw new NotFoundException("Recipient not found");
  }
  const attachmentUrls = await multipleMulterFilesToStaticUrls(
    input.attachments
  );

  const message = await MessageModel.create({
    sender: sender._id,
    recipient: recipientId,
    content: input.content,
    attachments: attachmentUrls,
  });
  const lastTime = await lastMessageTime(sender._id.toString(), recipientId);

  // 1 days
  if (Date.now() - lastTime.getTime() > 1000 * 60 * 60 * 24) {
    await notifyUnreadMessage(message);
  }

  await signalNewMessage(message);

  return message.jsonify();
}

export interface CreateMessageInput {
  content: string;
  attachments?: Express.Multer.File[];
}

export async function revokeMessage(messageId: string): Promise<MessageJSON> {
  const message = await MessageModel.findById(messageId).exec();
  if (!message) {
    throw new NotFoundException(`Message with ID ${messageId} not found`);
  }
  message.revoked = true;
  await message.save();

  await signalRevokedMessage(message);

  return message.jsonify();
}

/**
 * List Messages by Cursors
 */
export async function listMessageInConversation(
  options: MessageListOptions
): Promise<MessageJSON[]> {
  const messages = await MessageModel.listByCursor(options).find({
    $or: [
      {
        sender: options.firstParticipantId,
        recipient: options.secondParticipantId,
      },
      {
        sender: options.secondParticipantId,
        recipient: options.firstParticipantId,
      },
    ],
  });
  return Message.jsonifyAll(messages);
}

export interface MessageListOptions extends ListOptions {
  firstParticipantId: string;
  secondParticipantId: string;
}
