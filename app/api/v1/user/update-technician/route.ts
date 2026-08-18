import { dbConnect } from "@/lib/database/db";
import { User } from "@/lib/schema/user";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { techId, skills, isAvailable, phone } = body;

    if (!techId) {
      return NextResponse.json(
        { success: false, message: "Technician ID is required" },
        { status: 400 },
      );
    }

    // Build the dynamic update payload
    const updateData: any = {};
    if (skills !== undefined) updateData.skills = skills;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (phone !== undefined) updateData.phone = phone;

    // Use findOneAndUpdate with the role filter as an extra security measure
    // to ensure an admin can't accidentally "update" another Admin's profile via this route
    const updatedTech = await User.findOneAndUpdate(
      { _id: techId, role: "TECHNICIAN" },
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-currentLocation");

    if (!updatedTech) {
      return NextResponse.json(
        { success: false, message: "Valid Technician not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedTech });
  } catch (error) {
    console.error("Failed to update technician:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update technician details",
        },
      },
      { status: 500 },
    );
  }
}
