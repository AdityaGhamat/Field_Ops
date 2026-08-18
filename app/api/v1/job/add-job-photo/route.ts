import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextResponse } from "next/server";

export interface AddJobPhotoRequestBody {
  jobId: string;
  url: string;
  category: string;
}

export default async function PATCH(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { jobId, url, category }: AddJobPhotoRequestBody = body;
    const updatedJob = await Job.findByIdAndUpdate(jobId, {
      $push: { photos: { url, category, uploadedAt: new Date() } },
    });
    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to add job photo" },
      },
      { status: 500 },
    );
  }
}
