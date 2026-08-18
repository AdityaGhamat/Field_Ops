import { dbConnect } from "@/lib/database/db";
import { User } from "@/lib/schema/user";
import { success } from "better-auth";
import { NextRequest, NextResponse } from "next/server";

export default async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const techs = await User.find({ role: "TECHNICIAN", isAvailable: true })
      .select("name phone currentLocation")
      .lean();
    if (!techs) {
      return NextResponse.json({
        success: true,
        message: "No technicians found",
      });
    }
    return NextResponse.json({
      success: true,
      data: techs,
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
