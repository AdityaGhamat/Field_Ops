import { Schema, model, models, Document, Types } from "mongoose";

export type UserRole = "ADMIN" | "DISPATCHER" | "TECHNICIAN";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  emailVerified: boolean;

  role: UserRole;
  phone?: string;
  isAvailable: boolean;
  skills: string[];

  currentLocation?: {
    type: "Point";
    coordinates: [number, number];
    updatedAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ["ADMIN", "DISPATCHER", "TECHNICIAN"],
      default: "TECHNICIAN",
      index: true,
    },
    phone: { type: String },
    isAvailable: { type: Boolean, default: true, index: true },
    skills: [{ type: String }],

    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
      updatedAt: { type: Date },
    },
  },
  { timestamps: true },
);

UserSchema.index({ currentLocation: "2dsphere" });

export const User = models.User || model<IUser>("User", UserSchema, "user");
