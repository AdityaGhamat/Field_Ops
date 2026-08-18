import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { Customer } from "@/lib/schema/customer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      title,
      description,
      priority,
      addressString,
      lng,
      lat,
      customerId,
      scheduledStart,
      scheduledEnd,
      estimatedCost,
      userId, // ID of the Admin/Dispatcher creating the job
    } = body;

    // Fetch customer to denormalize their details into the Job document
    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    const newJob = await Job.create({
      title,
      description,
      priority: priority || "MEDIUM",
      addressString,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      customerId,
      customerSummary: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
      scheduledStart,
      scheduledEnd,
      estimatedCost: estimatedCost || 0,
      status: "NEW",
      timeline: [
        {
          status: "NEW",
          timestamp: new Date(),
          updatedBy: userId,
          note: "Service request created.",
        },
      ],
    });

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create job" },
      },
      { status: 500 },
    );
  }
}
