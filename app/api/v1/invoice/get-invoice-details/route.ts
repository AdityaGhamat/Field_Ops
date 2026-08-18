import { dbConnect } from "@/lib/database/db";
import { Invoice } from "@/lib/schema/invoice";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("id");

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Invoice ID is required" },
        { status: 400 },
      );
    }

    const invoice = await Invoice.findById(invoiceId).lean();

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to get invoice details",
        },
      },
      { status: 500 },
    );
  }
}
