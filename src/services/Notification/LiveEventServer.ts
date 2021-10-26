import { Server } from "socket.io";
import http from "http";
import {
  EventType,
  NotificationModel,
  NotificationType,
} from "@/models/Notification";
import { expressAuthentication } from "@/services/Authentication";
import express from "express";

class LiveEventServer {
  private _io?: Server;

  get io(): Server {
    if (!this._io) {
      console.error("Connect LiveEvent server first");
      process.exit(1);
    }
    return this._io;
  }

  connect(httpServer: http.Server) {
    this._io = new Server(httpServer, {});
    this._io.use(async (socket, next) => {
      const user = await expressAuthentication(
        socket.request as express.Request,
        "jwt"
      );

      //@ts-ignore
      socket.request.user = user;

      socket.join(user._id.toString());

      next();
    });
  }

  async signalEventToUser(userId: string, type: EventType, payload: object) {
    this.io.to(userId).emit(EventType[type], payload);
  }

  async notifyUser(
    userId: string,
    type: NotificationType,
    payload: object
  ): Promise<void> {
    await NotificationModel.create({
      owner: userId,
      type,
      payload,
    });

    this.io.to(userId).emit(NotificationType[type], payload);
  }

  async broadcast(type: NotificationType, payload: object): Promise<void> {
    await NotificationModel.create({
      type,
      payload,
    });

    this.io.emit(NotificationType[type], payload);
  }
}

export default new LiveEventServer();
