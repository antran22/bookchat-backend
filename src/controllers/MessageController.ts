import {
  Delete,
  FormField,
  Get,
  Path,
  Post,
  Query,
  Request,
  Route,
  Security,
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
} from "@/services/Message/Message";
import { MessageJSON } from "@/models/Message/Message";
import {
  addOrUpdateContact,
  ContactListItemJSON,
  listContacts,
} from "@/services/Message/Contact";

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
    @UploadedFiles() attachments?: Express.Multer.File[]
  ): Promise<MessageJSON> {
    // Todo: notify this message

    const message = await createMessage(request.user, recipientID, {
      content,
      attachments,
    });

    await addOrUpdateContact(request.user, recipientID);

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
    // Todo: Notify SocketIO about this revocation
    return revokeMessage(messageId);
  }

  @Security("jwt")
  @Get("/contacts")
  public async getContacts(
    @Request() request: express.Request,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<ContactListItemJSON>> {
    const contacts = await listContacts(request.user, { limit, cursor });
    const lastContactId = getLastID(contacts);

    const nextUrl = lastContactId
      ? env.resolveAPIPath(request.path, {
          cursor: lastContactId,
          limit,
        })
      : undefined;

    return {
      data: contacts,
      nextUrl,
    };
  }
}
