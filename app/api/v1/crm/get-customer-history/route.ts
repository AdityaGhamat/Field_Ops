import { dbConnect } from "@/lib/database/db";
import { Customer } from "@/lib/schema/customer";
import { Job } from "@/lib/schema/job";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const q = request.nextUrl.searchParams;
    const customerId = q.get("cid");
    const [customer, history] = await Promise.all([
      Customer.findById(customerId).lean(),
      Job.find({ customerId: customerId })
        .select("title status scheduledStart totalAmount")
        .sort({ scheduledStart: -1 })
        .lean(),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        customer,
        history,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to get customer history",
        },
      },
      { status: 500 },
    );
  }
}
