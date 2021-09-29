import { Types } from "mongoose";
import { Message, MessageJSON, MessageModel } from "@/models/Message";
import { User, UserModel } from "@/models/User";
import { multipleMulterFilesToStaticUrls, NotFoundException } from "@/utils";
import { ListOptions } from "@/models/_BaseModel";

export async function createMessage(
  sender: User,
  recipientId: string,
  input: CreateMessageInput
): Promise<MessageJSON> {
  if (!(await UserModel.exists({ _id: recipientId }))) {
    throw new NotFoundException("Recipient not found");
  }
  const attachmentUrls = await multipleMulterFilesToStaticUrls(input.attachments);
  const message = await MessageModel.create({
    sender: sender._id,
    recipient: recipientId,
    content: input.content,
    attachments: attachmentUrls,
  });
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
  return message.jsonify();
}

/**
 * List Messages by Cursors
 */
export async function listMessageInConversation(
  options: MessageListOptions
): Promise<MessageJSON[]> {
  let query;
  if (options.cursor) {
    query = MessageModel.find({
      _id: {
        $gt: new Types.ObjectId(options.cursor),
      },
    });
  } else {
    query = MessageModel.find();
  }
  query = query.find({
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
  const messages = await query.limit(options.limit).exec();
  return Message.jsonifyAll(messages);
}

export interface MessageListOptions extends ListOptions {
  firstParticipantId: string;
  secondParticipantId: string;
}
