import { dbConnect } from "@/lib/database/db";
import { Invoice } from "@/lib/schema/invoice";
import { NextRequest, NextResponse } from "next/server";

export default async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const financials = await Invoice.aggregate([
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 },
        },
      },
    ]);
    if (financials.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No financials data found",
      });
    }
    return NextResponse.json({
      success: true,
      data: financials,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to find financial summary",
        },
      },
      { status: 500 },
    );
  }
}
