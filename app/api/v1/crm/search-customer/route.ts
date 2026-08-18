import { dbConnect } from "@/lib/database/db";
import { Customer, ICustomer } from "@/lib/schema/customer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const q = request.nextUrl.searchParams;
    const searchTerm = q.get("q");
    const customers = await Customer.find({
      $or: [
        { name: { $regex: searchTerm as string, $options: "i" } },
        { phone: { $regex: searchTerm as string, $options: "i" } },
      ],
    } as any)
      .limit(10)
      .lean();
    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to get customer",
        },
      },
      { status: 500 },
    );
  }
}
