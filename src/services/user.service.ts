import { DocumentDefinition } from "mongoose";
import UserModel, { IUserDocument } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

export async function register(
  user: DocumentDefinition<IUserDocument>
): Promise<void> {
  await UserModel.create(user);
}

export async function login(user: DocumentDefinition<IUserDocument>) {
  const foundUser = await UserModel.findOne({ name: user.name });
  if (!foundUser) throw new Error("User not found");

  const isMatch = await bcrypt.compare(user.password, foundUser.password);
  if (!isMatch) throw new Error("Invalid password");

  const token = jwt.sign(
    { _id: foundUser._id, name: foundUser.name },
    SECRET_KEY,
    { expiresIn: "2d" }
  );
  return { user: { _id: foundUser._id, name: foundUser.name }, token };
}
