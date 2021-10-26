import { Message } from "@/models/Message/Message";
import { EventType, NotificationType } from "@/models/Notification";
import { Post, PostComment, PostLike } from "@/models/Post";

import { LiveEventServer } from "@/services/Notification";

export async function notifyUnreadMessage(message: Message) {
  const messageJSON = await message.jsonify();

  await LiveEventServer.notifyUser(
    messageJSON.recipient,
    NotificationType.UNREAD_MESSAGE,
    messageJSON
  );
}

export async function signalNewMessage(message: Message) {
  const messageJSON = await message.jsonify();

  await LiveEventServer.signalEventToUser(
    messageJSON.recipient,
    EventType.NEW_MESSAGE,
    messageJSON
  );
}

export async function signalRevokedMessage(message: Message) {
  const messageJSON = await message.jsonify();

  await LiveEventServer.signalEventToUser(
    messageJSON.recipient,
    EventType.REVOKED_MESSAGE,
    messageJSON
  );
}

export async function notifyNewPost(post: Post) {
  const postJSON = await post.jsonify();

  await LiveEventServer.broadcast(NotificationType.NEW_POST, postJSON);
}

export async function notifyNewPostComment(comment: PostComment) {
  const commentJSON = await comment.jsonify(["post"]);
  const postAuthor = commentJSON.post!.author!;

  await LiveEventServer.notifyUser(
    postAuthor._id,
    NotificationType.NEW_COMMENT,
    commentJSON
  );
}

export async function notifyNewPostLike(like: PostLike) {
  const likeJSON = await like.jsonify(["post"]);
  const postAuthor = likeJSON.post!.author!;

  await LiveEventServer.notifyUser(
    postAuthor._id,
    NotificationType.NEW_COMMENT,
    likeJSON
  );
}
