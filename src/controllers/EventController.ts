import {
  Controller,
  FormField,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
  UploadedFiles,
} from "@tsoa/runtime";
import express from "express";
import { Listing, wrapListingResult } from "@/controllers/_ControllerUtils";
import { ModelNotFoundException } from "@/utils";
import { EventJSON, EventModel } from "@/models/Event";
import { createEvent, listEvents, updateEvent } from "@/services/Event";

@Tags("Event")
@Route("events/")
export class EventController extends Controller {
  /**
   * List all existing events
   * @isInt limit
   * @maximum limit 100 Fetch at most 100 events at once
   */
  @Get("/")
  public async list(
    @Request() request: express.Request,
    @Query() limit: number,
    @Query() cursor?: string
  ): Promise<Listing<EventJSON>> {
    const events = await listEvents({ limit, cursor });

    return wrapListingResult(events, request);
  }

  /**
   * Get a single event
   */
  @Get("/{eventId}")
  public async get(
    @Request() request: express.Request,
    @Path() eventId: string
  ): Promise<EventJSON> {
    const event = await EventModel.findById(eventId).exec();
    if (!event) {
      throw new ModelNotFoundException(EventModel, eventId);
    }

    return event.jsonify();
  }

  /**
   * Create an event
   */
  @Security("jwt")
  @Post("/")
  public async create(
    @Request() request: express.Request,
    @FormField() name: string,
    @FormField() content: string,
    @FormField() date: Date,
    @UploadedFiles() attachments?: Express.Multer.File[]
  ): Promise<EventJSON> {
    return createEvent({ name, content, date, attachments }, request.user);
  }

  /**
   * Update an event
   */
  @Security("jwt")
  @Put("/{eventId}")
  public async update(
    @Request() request: express.Request,
    @Path() eventId: string,
    @FormField() name: string,
    @FormField() content: string,
    @FormField() date: Date,
    @UploadedFiles() attachments?: Express.Multer.File[]
  ): Promise<EventJSON> {
    return updateEvent(
      eventId,
      { name, content, date, attachments },
      request.user
    );
  }
}
