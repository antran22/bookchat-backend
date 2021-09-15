import { DatabaseModel } from "./_BaseModel";
import { Types } from "mongoose";
import _ from "lodash";
import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User"

export class Book extends DatabaseModel {
    @prop({required: true})
    name!: string;

    @prop({required: true})
    isnb!: string;

    @prop({required: true})
    description!: string

    @prop({required: true})
    publisher!: string

    @prop({
        type: () => Types.ObjectId,
        ref: User,
        foreignField: '_id',
        localField: 'author',
        justOne: true
    })
    author!: Ref<User>

    @prop({
        type: () => Types.ObjectId,
        ref: User,
        foreignField: '_id',
        localField: 'translator',
        justOne: true
    })
    translator!: Ref<User>

    sanitise(): SanitisedBook {
        return _.omit(this.toJSON(), "__v");
    }
}

export type SanitisedBook = Omit<Book, "__v">;

export const BookModel = getModelForClass(Book);