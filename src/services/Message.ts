import { Types } from "mongoose";
import { Message, MessageModel } from "@/models/Message";
import { User, UserModel } from "@/models/User";
import { NotFoundException, saveMulterFileAndGetStaticUrl } from "@/utils";

export async function createMessage(
  sender: User,
  recipientId: string,
  content: string,
  attachments: Express.Multer.File[]
): Promise<Message> {
  if (!(await UserModel.exists({ _id: recipientId }))) {
    throw new NotFoundException("Recipient not found");
  }
  const attachmentUrls = attachments.map(saveMulterFileAndGetStaticUrl);
  return MessageModel.create({
    sender: sender._id,
    recipient: recipientId,
    content,
    attachments: attachmentUrls,
  });
}

export async function revokeMessage(messageId: string): Promise<Message> {
  const message = await MessageModel.findById(messageId).exec();
  if (!message) {
    throw new NotFoundException(`Message with ID ${messageId} not found`);
  }
  message.revoked = true;
  await message.save();
  return message;
}

/**
 * List Messages by Cursors
 */
export async function listMessageInConversation(
  filter: ConversationFilter
): Promise<Message[]> {
  let query;
  if (filter.cursor) {
    query = MessageModel.find({
      _id: {
        $gt: new Types.ObjectId(filter.cursor),
      },
    });
  } else {
    query = MessageModel.find();
  }
  query = query.find({
    $or: [
      {
        sender: filter.firstParticipantId,
        recipient: filter.secondParticipantId,
      },
      {
        sender: filter.secondParticipantId,
        recipient: filter.firstParticipantId,
      },
    ],
  });
  return await query.limit(filter.limit).exec();
}

export type ConversationFilter = {
  limit: number;
  cursor?: string;
  firstParticipantId: string;
  secondParticipantId: string;
};
