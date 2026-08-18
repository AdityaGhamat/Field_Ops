import { dbConnect } from "@/lib/database/db";
import { Invoice } from "@/lib/schema/invoice";
import { Job } from "@/lib/schema/job";
import { Customer } from "@/lib/schema/customer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { jobId, lineItems, taxRate = 0, discount = 0, dueDate } = body;

    // Fetch the linked Job and Customer to populate the Invoice
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    const customer = await Customer.findById(job.customerId).lean();
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    // Calculate Financials
    const subtotal = lineItems.reduce(
      (acc: number, item: any) => acc + item.total,
      0,
    );
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount - discount;

    // Generate Invoice Number (e.g., INV-2026-1725381)
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newInvoice = await Invoice.create({
      invoiceNumber,
      jobId,
      customerId: customer._id,
      customerSummary: {
        name: customer.name,
        email: customer.email,
        billingAddress: customer.billingAddress,
      },
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      totalAmount,
      dueDate: new Date(dueDate),
      status: "UNPAID",
    });

    // Optionally update the Job status to INVOICED
    await Job.findByIdAndUpdate(jobId, { status: "INVOICED" });

    return NextResponse.json(
      { success: true, data: newInvoice },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create invoice" },
      },
      { status: 500 },
    );
  }
}
