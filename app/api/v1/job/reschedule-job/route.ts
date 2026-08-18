import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const { jobId, scheduledStart, scheduledEnd, userId, note } =
      await request.json();

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          scheduledStart: new Date(scheduledStart),
          scheduledEnd: new Date(scheduledEnd),
        },
        $push: {
          timeline: {
            status: "SCHEDULED",
            timestamp: new Date(),
            updatedBy: userId,
            note: note || "Job rescheduled by dispatch.",
          },
        },
      },
      { new: true },
    );

    if (!updatedJob) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to reschedule job" },
      },
      { status: 500 },
    );
  }
}
