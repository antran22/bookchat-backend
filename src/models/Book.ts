import { DatabaseModel } from "./_BaseModel";
import { Types } from "mongoose";
import _ from "lodash";
import { prop, getModelForClass } from "@typegoose/typegoose";
import { User } from "./User"

export class Book extends DatabaseModel {
    @prop()
    name!: string;

    @prop()
    isnb!: string;

    @prop()
    description!: string

    @prop()
    publisher!: string

    @prop({ref: () => User})
    author!: Types.ObjectId

    sanitise(): SanitisedBook {
        return _.omit(this.toJSON(), "__v");
    }
}

export type SanitisedBook = Omit<Book, "__v">;

export const BookModel = getModelForClass(Book);