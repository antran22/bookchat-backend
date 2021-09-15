import {
  FormField,
  Path,
  Security,
  Post,
  Get,
  Delete,
  Query,
  Request,
  Route,
  Tags,
  UploadedFiles,
} from "@tsoa/runtime";
import { SanitisedMessage } from "@/models/Message";
import type express from "express";
import { env } from "@/utils";
import type { Listing } from "./_ControllerUtils";
import {
  createMessage,
  listMessageInConversation,
  revokeMessage,
} from "@/services/Message";

@Tags("Message")
@Route("messages")
export class MessagesController {
  /**
   * List out all the messages between the authorised person and the token.
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 messages at once
   */
  @Security("jwt")
  @Get("/")
  public async list(
    @Request() request: express.Request,
    @Query() recipientId: string,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<SanitisedMessage>> {
    const messages = await listMessageInConversation({
      firstParticipantId: request.user._id.toString(),
      secondParticipantId: recipientId,
      limit,
      cursor,
    });

    const sanitisedMessages = messages.map((u) => u.sanitise());
    if (!sanitisedMessages || sanitisedMessages.length === 0) {
      return {
        data: sanitisedMessages,
      };
    }

    const lastMessageID = sanitisedMessages[sanitisedMessages.length - 1]._id;
    const nextUrl = env.resolveAPIPath(
      `/messages?recipientId=${recipientId}cursor=${lastMessageID}&limit=${limit}`
    );
    return {
      data: sanitisedMessages,
      nextUrl,
    };
  }

  /**
   * Send a message to another person.
   */
  @Security("jwt")
  @Post("/")
  public async sendMessage(
    @Request() request: express.Request,
    @FormField() recipientId: string,
    @FormField() content: string,
    @UploadedFiles() attachments: Express.Multer.File[]
  ): Promise<SanitisedMessage> {
    const message = await createMessage(
      request.user,
      recipientId,
      content,
      attachments
    );
    // Todo: Notify SocketIO about this message
    return message.sanitise();
  }

  /**
   * Revoke a single message
   */
  @Security("jwt")
  @Delete("/{messageId}")
  public async revokeMessage(
    @Request() request: express.Request,
    @Path() messageId: string
  ): Promise<SanitisedMessage> {
    const message = await revokeMessage(messageId);
    return message.sanitise();
  }
}
