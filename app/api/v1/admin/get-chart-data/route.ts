import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { Invoice } from "@/lib/schema/invoice";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Default to the last 7 days if no range is provided
    const days = parseInt(searchParams.get("days") || "7");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1. Aggregate Jobs per day
    const jobStats = await Job.aggregate([
      {
        $match: { scheduledStart: { $gte: startDate, $lte: endDate } },
      },
      {
        $group: {
          // Group by Date string (YYYY-MM-DD)
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$scheduledStart" },
          },
          totalJobs: { $sum: 1 },
          completedJobs: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. Aggregate Revenue per day (based on invoice creation)
    const revenueStats = await Invoice.aggregate([
      {
        $match: { createdAt: { $gte: startDate, $lte: endDate } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Merge the datasets by date for the frontend charting library
    // Create a map of the last X days to ensure zero-value days are included
    const chartData = [];
    for (let i = 0; i < days; i++) {
      const target = new Date(startDate);
      target.setDate(startDate.getDate() + i);
      const dateStr = target.toISOString().split("T")[0];

      const jobDay = jobStats.find((j) => j._id === dateStr) || {
        totalJobs: 0,
        completedJobs: 0,
      };
      const revDay = revenueStats.find((r) => r._id === dateStr) || {
        revenue: 0,
      };

      chartData.push({
        date: dateStr,
        totalJobs: jobDay.totalJobs,
        completedJobs: jobDay.completedJobs,
        revenue: revDay.revenue,
      });
    }

    return NextResponse.json({ success: true, data: chartData });
  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to generate chart data",
        },
      },
      { status: 500 },
    );
  }
}
