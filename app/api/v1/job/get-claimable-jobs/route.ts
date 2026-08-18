import { Job } from "@/lib/schema/job";
import { dbConnect } from "@/lib/database/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const jobs = await Job.find({ status: "CLAIMABLE" })
      .sort({ createdAt: -1 })
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
