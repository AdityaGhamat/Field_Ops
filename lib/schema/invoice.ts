import { Types, Schema, models, model } from "mongoose";

export type InvoiceStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "VOID";

export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string; // e.g. "INV-2026-001"
  jobId: Types.ObjectId;
  customerId: Types.ObjectId;

  customerSummary: {
    name: string;
    email: string;
    billingAddress: string;
  };

  lineItems: IInvoiceLineItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.08 for 8%
  taxAmount: number;
  discount: number;
  totalAmount: number;

  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: "CREDIT_CARD" | "CASH" | "BANK_TRANSFER" | "CHECK";

  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    customerSummary: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      billingAddress: { type: String, required: true },
    },

    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true },
      },
    ],

    subtotal: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"],
      default: "UNPAID",
      index: true,
    },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["CREDIT_CARD", "CASH", "BANK_TRANSFER", "CHECK"],
    },
  },
  { timestamps: true },
);

export const Invoice =
  models.Invoice || model<IInvoice>("Invoice", InvoiceSchema);
