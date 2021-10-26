import { ListOptions } from "@/models/_BaseModel";
import { EventJSON, EventModel } from "@/models/Event";
import type { Types } from "mongoose";
import {
  ForbiddenException,
  ModelNotFoundException,
  multipleMulterFilesToStaticUrls,
} from "@/utils";
import { User } from "@/models/User";
import _ from "lodash";

export async function listEvents(
  options: ListEventOptions
): Promise<EventJSON[]> {
  const events = await EventModel.listByCursor(options);
  return EventModel.jsonifyAll(events);
}

export interface ListEventOptions extends ListOptions {}

export async function createEvent(
  input: CreateEventInput,
  host: User
): Promise<EventJSON> {
  const attachmentUrls = await multipleMulterFilesToStaticUrls(
    input.attachments
  );
  const event = await EventModel.create({
    host,
    name: input.name,
    content: input.content,
    date: input.date,
    attachments: attachmentUrls,
  });
  return event.jsonify();
}

export interface CreateEventInput {
  name: string;
  content: string;
  date: Date;
  attachments?: Express.Multer.File[];
}

export async function updateEvent(
  eventId: string,
  input: UpdateEventInput,
  user: User
): Promise<EventJSON> {
  const event = await EventModel.findById(eventId).exec();

  if (!event) {
    throw new ModelNotFoundException(EventModel, eventId);
  }

  if (!user._id.equals(event.host as Types.ObjectId)) {
    throw new ForbiddenException("Cannot edit other people's event");
  }

  const newInput = {
    ...input,
    attachments: input.attachments
      ? await multipleMulterFilesToStaticUrls(input.attachments)
      : undefined,
  };

  _.assign(event, newInput);

  await event.save();

  return event.jsonify();
}

export type UpdateEventInput = Partial<CreateEventInput>;
