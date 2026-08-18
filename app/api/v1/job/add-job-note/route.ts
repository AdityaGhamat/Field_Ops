import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { jobId, text, authorId, authorName } = body;

    if (!jobId || !text || !authorId || !authorName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Push the new note into the notes array
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $push: {
          notes: {
            authorId,
            authorName,
            text,
            createdAt: new Date(),
          },
        },
      },
      { new: true }, // Return the updated document
    );

    if (!updatedJob) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: updatedJob },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to add job note:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to add job note" },
      },
      { status: 500 },
    );
  }
}
