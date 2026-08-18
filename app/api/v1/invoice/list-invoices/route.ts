import { dbConnect } from "@/lib/database/db";
import { Invoice } from "@/lib/schema/invoice";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Filters
    const query: any = {};
    const status = searchParams.get("status");
    if (status) query.status = status;

    const customerId = searchParams.get("customerId");
    if (customerId) query.customerId = customerId;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch invoices" },
      },
      { status: 500 },
    );
  }
}
