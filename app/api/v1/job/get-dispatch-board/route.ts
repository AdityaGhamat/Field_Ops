import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const targetDate = searchParams.get("targetDate");
    if (!targetDate)
      return NextResponse.json(
        { error: "Missing targetDate" },
        { status: 400 },
      );
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
