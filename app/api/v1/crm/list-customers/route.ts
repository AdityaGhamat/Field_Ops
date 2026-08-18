import { dbConnect } from "@/lib/database/db";
import { Customer } from "@/lib/schema/customer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Dynamic query filters
    const query: any = {};

    // Optional filter to show only active or inactive customers
    const isActive = searchParams.get("isActive");
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    // Pagination setup
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 }) // Show newest clients first
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch customers list:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch customers" },
      },
      { status: 500 },
    );
  }
}
