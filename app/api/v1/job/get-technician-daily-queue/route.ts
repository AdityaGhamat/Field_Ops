import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { techId } = body;

    const start = new Date().setHours(0, 0, 0, 0);
    const end = new Date().setHours(23, 59, 59, 999);

    const jobs = await Job.find({
      assignedTechId: techId,
      scheduledStart: { $gte: start, $lte: end },
      status: { $in: ["ASSIGNED", "EN_ROUTE", "ON_SITE"] },
    })
      .sort({ scheduledStart: 1 })
      .lean();
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to get jobs" },
      },
      { status: 500 },
    );
  }
}
