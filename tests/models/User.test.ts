import { UserModel } from "@/models/User";
import { mongoose } from "@typegoose/typegoose";
import _ = require("lodash");

describe("The UserModel", () => {
  it("should be able create a new User", async () => {
    const userCreationInput = {
      firebaseId: "1",
      gender: "helicopter",
      displayName: "John Doe",
      avatar: "https://image.url",
    };
    const user = await UserModel.create(userCreationInput);
    expect(user).toBeTruthy();
    expect(user).toEqual(expect.objectContaining(userCreationInput));
  });

  it("should throw an error if firebaseId is not specified", async () => {
    const userPromise = UserModel.create({
      gender: "abrams tank",
      displayName: "Jean Deer",
      avatar: "https://image2.url",
    });
    await expect(userPromise).rejects.toThrowError(
      mongoose.Error.ValidationError
    );
  });

  it("should throw an error if displayName is not specified", async () => {
    const userPromise = UserModel.create({
      gender: "abrams tank",
      displayName: "Jean Deer",
      avatar: "https://image2.url",
    });
    await expect(userPromise).rejects.toThrowError(
      mongoose.Error.ValidationError
    );
  });

  it("should be able to fetch a previously inserted user here", async () => {
    const userCreationInput = {
      firebaseId: "3",
      gender: "katyusha cannon",
      displayName: "Jim Moose",
      avatar: "https://image3.url",
    };
    await UserModel.create(userCreationInput);

    const user = await UserModel.findOne({ firebaseId: "3" }).exec();
    expect(user).toBeTruthy();
    expect(user).toHaveProperty("_id");
    expect(user).toEqual(expect.objectContaining(userCreationInput));
  });

  it("should be able to jsonify cleanly", async () => {
    const userCreationInput = {
      firebaseId: "4",
      gender: "iron dome",
      displayName: "Jack Reindeer",
      avatar: "https://image4.url",
    };
    const user = await UserModel.create(userCreationInput);
    const json = await user.jsonify();

    expect(json).toBeTruthy();
    expect(json).toEqual(
      expect.objectContaining(_.omit(userCreationInput, "firebaseId"))
    );
    expect(json).toHaveProperty("_id");
    expect(json).toHaveProperty("createdAt");
    expect(json).not.toHaveProperty("__v");
  });
});
