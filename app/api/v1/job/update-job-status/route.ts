import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextResponse } from "next/server";

export interface DispatchBoardRequestBody {
  jobId: string;
  newStatus: string;
  userId: string;
  note: string;
}

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const { jobId, newStatus, userId, note }: DispatchBoardRequestBody =
      await request.json();
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: { status: newStatus },
        $push: {
          timeline: {
            status: newStatus,
            timeStamp: new Date(),
            updatedBy: userId,
            note: note,
          },
        },
      },
      { new: true },
    );
    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update job status" },
      },
      { status: 500 },
    );
  }
}
