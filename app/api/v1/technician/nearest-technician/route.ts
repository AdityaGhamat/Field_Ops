import { dbConnect } from "@/lib/database/db";
import { User } from "@/lib/schema/user";
import { NextRequest, NextResponse } from "next/server";

const distance = 10000;

export interface NearestTechnicianReq {
  lng: number;
  lat: number;
  maxDistanceMeters: number;
}
export default async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { lng, lat, maxDistanceMeters }: NearestTechnicianReq = body;
    const nearestTechs = await User.find({
      role: "TECHNICIAN",
      isAvailable: true,
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistanceMeters,
        },
      },
    }).lean();
    if (nearestTechs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No technicians found",
      });
    }
    return NextResponse.json({
      success: true,
      data: nearestTechs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to get technicians" },
      },
      { status: 500 },
    );
  }
}
