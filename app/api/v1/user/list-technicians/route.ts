import { dbConnect } from "@/lib/database/db";
import { User } from "@/lib/schema/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Enforce that we only pull users with the TECHNICIAN role
    const query: any = { role: "TECHNICIAN" };

    // Optional filters
    const isAvailable = searchParams.get("isAvailable");
    if (isAvailable !== null) {
      query.isAvailable = isAvailable === "true";
    }

    // Optional text search across name, email, or phone
    const search = searchParams.get("search");
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const [technicians, total] = await Promise.all([
      User.find(query)
        .select("-currentLocation") // Exclude the high-frequency map data for standard lists
        .sort({ name: 1 }) // Alphabetical order
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: technicians,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch technicians list:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to list technicians" },
      },
      { status: 500 },
    );
  }
}
