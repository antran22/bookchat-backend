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
import type express from "express";
import { env, getLastID } from "@/utils";
import type { Listing } from "./_ControllerUtils";
import {
  createMessage,
  listMessageInConversation,
  revokeMessage,
} from "@/services/Message";
import { MessageJSON } from "@/models/Message";

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
    @Query() recipientID: string,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<MessageJSON>> {
    const messages = await listMessageInConversation({
      firstParticipantId: request.user._id.toString(),
      secondParticipantId: recipientID,
      limit,
      cursor,
    });

    const lastMessageID = getLastID(messages);

    const nextUrl = lastMessageID
      ? env.resolveAPIPath(`/messages`, {
          recipientID,
          cursor: lastMessageID,
          limit,
        })
      : undefined;
    return {
      data: messages,
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
    @FormField() recipientID: string,
    @FormField() content: string,
    @UploadedFiles() attachments: Express.Multer.File[]
  ): Promise<MessageJSON> {
    const message = await createMessage(
      request.user,
      recipientID,
      content,
      attachments
    );
    // Todo: Notify SocketIO about this message
    return message;
  }

  /**
   * Revoke a single message
   */
  @Security("jwt")
  @Delete("/{messageId}")
  public async revokeMessage(
    @Request() request: express.Request,
    @Path() messageId: string
  ): Promise<MessageJSON> {
    const message = await revokeMessage(messageId);
    // Todo: Notify SocketIO about this revocation
    return message;
  }
}
