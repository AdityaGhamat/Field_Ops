import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const targetDate = searchParams.get("targetDate");

    if (!targetDate) {
      return NextResponse.json(
        {
          success: false,
          message: "targetDate is required",
        },
        { status: 400 },
      );
    }

    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const jobStats = await Job.aggregate([
      {
        $match: {
          scheduledStart: {
            $gte: start,
            $lt: end,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalEstimatedValue: {
            $sum: "$estimatedCost",
          },
        },
      },
    ]);

    const kpis = {
      totalJobs: 0,
      completed: 0,
      inProgress: 0,
      potentialRevenue: 0,
    };

    jobStats.forEach((stat) => {
      kpis.totalJobs += stat.count;
      kpis.potentialRevenue += stat.totalEstimatedValue ?? 0;

      if (stat._id === "COMPLETED") {
        kpis.completed = stat.count;
      }

      if (["EN_ROUTE", "ON_SITE"].includes(stat._id)) {
        kpis.inProgress += stat.count;
      }
    });

    return NextResponse.json({
      success: true,
      data: kpis,
    });
  } catch (error) {
    console.error("Failed to fetch job stats:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch job statistics",
      },
      { status: 500 },
    );
  }
}
