import { Types } from "mongoose";
import { Message, MessageJSON, MessageModel } from "@/models/Message";
import { User, UserModel } from "@/models/User";
import { multipleMulterFilesToStaticUrls, NotFoundException } from "@/utils";
import { ListInput } from "@/services/_ServiceUtils";

export async function createMessage(
  sender: User,
  recipientId: string,
  content: string,
  attachments: Express.Multer.File[]
): Promise<MessageJSON> {
  if (!(await UserModel.exists({ _id: recipientId }))) {
    throw new NotFoundException("Recipient not found");
  }
  const attachmentUrls = await multipleMulterFilesToStaticUrls(attachments);
  const message = await MessageModel.create({
    sender: sender._id,
    recipient: recipientId,
    content,
    attachments: attachmentUrls,
  });
  return message.jsonify();
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
  input: MessageListInput
): Promise<MessageJSON[]> {
  let query;
  if (input.cursor) {
    query = MessageModel.find({
      _id: {
        $gt: new Types.ObjectId(input.cursor),
      },
    });
  } else {
    query = MessageModel.find();
  }
  query = query.find({
    $or: [
      {
        sender: input.firstParticipantId,
        recipient: input.secondParticipantId,
      },
      {
        sender: input.secondParticipantId,
        recipient: input.firstParticipantId,
      },
    ],
  });
  const messages = await query.limit(input.limit).exec();
  return Message.jsonifyAll(messages);
}

export interface MessageListInput extends ListInput {
  firstParticipantId: string;
  secondParticipantId: string;
}
