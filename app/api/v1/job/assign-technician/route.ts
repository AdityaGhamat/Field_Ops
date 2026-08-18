import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { User } from "@/lib/schema/user";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const { jobId, techId, userId } = await request.json();

    // Verify technician
    const tech = await User.findById(techId).lean();
    if (!tech || tech.role !== "TECHNICIAN") {
      return NextResponse.json(
        { success: false, message: "Valid Technician not found" },
        { status: 404 },
      );
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          assignedTechId: techId,
          assignedTechSummary: {
            name: tech.name,
            phone: tech.phone || "",
          },
          status: "ASSIGNED",
        },
        $push: {
          timeline: {
            status: "ASSIGNED",
            timestamp: new Date(),
            updatedBy: userId,
            note: `Job assigned to ${tech.name}.`,
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
        error: { code: "SERVER_ERROR", message: "Failed to assign technician" },
      },
      { status: 500 },
    );
  }
}
