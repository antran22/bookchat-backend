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
import { Listing, wrapListingResult } from "./_ControllerUtils";
import {
  addOrUpdateContact,
  ContactListItemJSON,
  createMessage,
  listContacts,
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

    return wrapListingResult(messages, request);
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
    return wrapListingResult(contacts, request);
  }
}
