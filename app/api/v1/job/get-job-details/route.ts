import { Job } from "@/lib/schema/job";
import { dbConnect } from "@/lib/database/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return NextResponse.json({
        success: false,
        message: "Job not found",
      });
    }
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to get job" },
      },
      { status: 500 },
    );
  }
}
