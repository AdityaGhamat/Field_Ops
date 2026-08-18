import { dbConnect } from "@/lib/database/db";
import { User } from "@/lib/schema/user";
import { NextResponse } from "next/server";

export interface UpdateTechnicianLocation {
  techId: string;
  lng: number;
  lat: number;
}
export default async function PATCH(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { techId, lat, lng }: UpdateTechnicianLocation = body;
    const technician = await User.findByIdAndUpdate(techId, {
      $set: {
        "currentLocation.coordinates": [lng, lat],
        "currentLocation.updatedAt": new Date(),
      },
    });
    return NextResponse.json({
      success: true,
      data: technician,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update technician" },
      },
      { status: 500 },
    );
  }
}
