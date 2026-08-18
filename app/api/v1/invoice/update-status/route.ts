import { dbConnect } from "@/lib/database/db";
import { Invoice } from "@/lib/schema/invoice";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { invoiceId, status, paymentMethod } = body;

    // Prepare update payload
    const updateData: any = { status };

    if (status === "PAID") {
      updateData.paidAt = new Date();
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { $set: updateData },
      { new: true },
    );

    if (!updatedInvoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update invoice status",
        },
      },
      { status: 500 },
    );
  }
}
