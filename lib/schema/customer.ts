import { model, models, Schema, Types } from "mongoose";

export interface IServiceLocation {
  _id?: Types.ObjectId;
  label: string; // e.g., "Main Office", "Warehouse #2"
  addressString: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  billingAddress: string;
  serviceLocations: IServiceLocation[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    companyName: { type: String },
    billingAddress: { type: String, required: true },

    serviceLocations: [
      {
        label: { type: String, required: true },
        addressString: { type: String, required: true },
        location: {
          type: { type: String, enum: ["Point"], default: "Point" },
          coordinates: { type: [Number], required: true }, // [lng, lat]
        },
      },
    ],

    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

CustomerSchema.index({ "serviceLocations.location": "2dsphere" });

export const Customer = model<ICustomer>("Customer", CustomerSchema);
