import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Build dynamic query filters
    const query: any = {};

    const status = searchParams.get("status");
    if (status) query.status = status;

    const techId = searchParams.get("techId");
    if (techId) query.assignedTechId = techId;

    const date = searchParams.get("date");
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.scheduledStart = { $gte: start, $lt: end };
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select("-photos -notes -timeline") // Omit heavy arrays for the table view
        .sort({ scheduledStart: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: jobs,
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
        error: { code: "SERVER_ERROR", message: "Failed to fetch jobs list" },
      },
      { status: 500 },
    );
  }
}
