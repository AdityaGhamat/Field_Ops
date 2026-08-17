import { Types, Schema, models, model, Document } from "mongoose";

export type JobStatus =
  | "NEW"
  | "SCHEDULED"
  | "CLAIMABLE"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "ON_SITE"
  | "COMPLETED"
  | "INVOICED"
  | "CANCELLED";

export type JobPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface IJobTimeline {
  status: JobStatus;
  timestamp: Date;
  updatedBy: Types.ObjectId;
  note?: string;
}

export interface IJobPhoto {
  url: string;
  category: "BEFORE" | "AFTER" | "EQUIPMENT" | "OTHER";
  uploadedAt: Date;
  caption?: string;
}

export interface IJobNote {
  authorId: Types.ObjectId;
  authorName: string;
  text: string;
  createdAt: Date;
}

export interface IJob extends Document {
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;

  // Spatial Data for Dispatch/Maps
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  addressString: string;

  // References
  customerId: Types.ObjectId;
  assignedTechId?: Types.ObjectId;

  // Fast-reading Denormalized Snapshots
  customerSummary: {
    name: string;
    phone: string;
    email: string;
  };
  assignedTechSummary?: {
    name: string;
    phone: string;
  };

  // Scheduling & Durations
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;

  // Field Data Capture
  timeline: IJobTimeline[];
  photos: IJobPhoto[];
  notes: IJobNote[];

  signature?: {
    imageUrl: string;
    signerName: string;
    signedAt: Date;
  };

  estimatedCost?: number;

  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "NEW",
        "SCHEDULED",
        "CLAIMABLE",
        "ASSIGNED",
        "EN_ROUTE",
        "ON_SITE",
        "COMPLETED",
        "INVOICED",
        "CANCELLED",
      ],
      default: "NEW",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    addressString: { type: String, required: true },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    assignedTechId: { type: Schema.Types.ObjectId, ref: "User", index: true },

    customerSummary: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    assignedTechSummary: {
      name: { type: String },
      phone: { type: String },
    },

    scheduledStart: { type: Date, required: true, index: true },
    scheduledEnd: { type: Date, required: true },
    actualStart: { type: Date },
    actualEnd: { type: Date },

    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        note: { type: String },
      },
    ],

    photos: [
      {
        url: { type: String, required: true },
        category: {
          type: String,
          enum: ["BEFORE", "AFTER", "EQUIPMENT", "OTHER"],
          default: "OTHER",
        },
        uploadedAt: { type: Date, default: Date.now },
        caption: { type: String },
      },
    ],

    notes: [
      {
        authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        authorName: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    signature: {
      imageUrl: { type: String },
      signerName: { type: String },
      signedAt: { type: Date },
    },

    estimatedCost: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Multi-attribute indexes for frequent filters
JobSchema.index({ status: 1, scheduledStart: 1 });
JobSchema.index({ location: "2dsphere" });

export const Job = models.Job || model<IJob>("Job", JobSchema);
