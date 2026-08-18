import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { targetDate }: { targetDate: Date } = body;
    const start = new Date(targetDate).setHours(0, 0, 0, 0);
    const end = new Date(targetDate).setHours(23, 59, 59, 999);
    const jobs = await Job.find({
      scheduledStart: { $gte: start, $lte: end },
    })
      .select("-photos -notes -timeline")
      .sort({ scheduledStart: 1 })
      .lean();
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to get dispatch jobs" },
      },
      { status: 500 },
    );
  }
}
