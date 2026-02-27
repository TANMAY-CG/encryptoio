import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  publicKey?: string;
  status: "pending" | "approved";
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    publicKey: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);