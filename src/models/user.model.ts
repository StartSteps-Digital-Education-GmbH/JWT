import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface IUserDocument extends mongoose.Document {
  name: string;
  password: string;
}

const UserSchema = new mongoose.Schema<IUserDocument>({
  name: { type: String, unique: true },
  password: { type: String },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const UserModel = mongoose.model<IUserDocument>("User", UserSchema);
export default UserModel;
