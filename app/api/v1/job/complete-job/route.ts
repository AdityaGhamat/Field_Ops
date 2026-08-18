import { Job } from "@/lib/schema/job";
import { dbConnect } from "@/lib/database/db";
import { NextResponse } from "next/server";

export interface CompleteJobRequestBody {
  jobId: string;
  imageUrl: string;
  signerName: string;
}

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { jobId, imageUrl, signerName }: CompleteJobRequestBody = body;

    const updatedJob = await Job.findByIdAndUpdate(jobId, {
      $set: {
        status: "COMPLETED",
        actualEnd: new Date(),
        signature: { imageUrl, signerName, signedAt: new Date() },
      },
    });

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, job: updatedJob },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to complete job" },
      { status: 500 },
    );
  }
}
