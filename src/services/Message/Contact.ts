import { User, UserJSON } from "@/models/User";
import { ListOptions } from "@/models/_BaseModel";
import { Contact, ContactJSON, ContactModel } from "@/models/Message/Contact";
import { Types } from "mongoose";
import { getUsersWithIds, mapUserIdToRecords } from "@/services/User";

export interface ContactListItemJSON {
  _id: string;
  user: UserJSON;
  lastTime: Date;
}

function matchContactsWithUserRecords(
  contacts: Contact[],
  userRecords: UserJSON[]
): ContactListItemJSON[] {
  const userIdToRecordMap = mapUserIdToRecords(userRecords);

  return contacts.map((contact) => {
    const user1 = userIdToRecordMap[contact.user1!.toString()];
    if (user1) {
      return {
        _id: contact._id.toString(),
        user: user1,
        lastTime : contact.lastTime,
      };
    }
    const user2 = userIdToRecordMap[contact.user2!.toString()];
    return {
      _id: contact._id.toString(),
      user: user2,
      lastTime : contact.lastTime,
    };
  });
}

export async function listContacts(
  user: User,
  options: ListOptions
): Promise<ContactListItemJSON[]> {
  const contacts = await ContactModel.listByCursor(options)
    .or([
      {
        user1: user._id,
      },
      {
        user2: user._id,
      },
    ])
    .sort({ lastTime: -1 })
    .exec();

  const contactIds = contacts.map((contact) => {
    if (user._id.equals(contact.user1 as Types.ObjectId)) {
      return contact.user2!.toString();
    }
    return contact.user1!.toString();
  });

  const users = await getUsersWithIds(contactIds);
  const userJSONs = await User.jsonifyAll(users);

  return matchContactsWithUserRecords(contacts, userJSONs);
}

export async function addOrUpdateContact(
  sender: User,
  recipientId: string
): Promise<ContactJSON> {
  let contact = await ContactModel.findOne()
    .or([
      { user1: sender._id, user2: recipientId },
      { user1: recipientId, user2: sender._id },
    ])
    .exec();
  if (!contact) {
    contact = new ContactModel({
      user1: sender._id,
      user2: recipientId,
    });
  }

  contact.lastTime = new Date();

  await contact.save();

  return contact.jsonify();
}
