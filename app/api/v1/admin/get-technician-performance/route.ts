import { dbConnect } from "@/lib/database/db";
import { Job } from "@/lib/schema/job";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Aggregate data grouped by the assigned technician
    const performanceStats = await Job.aggregate([
      {
        // Only look at jobs that have been assigned
        $match: { assignedTechId: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: "$assignedTechId",
          techName: { $first: "$assignedTechSummary.name" },
          totalAssigned: { $sum: 1 },

          // Count completed jobs
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },

          // Calculate time spent (actualEnd - actualStart) in milliseconds
          // Only if both fields exist and the job is completed
          totalTimeMs: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "COMPLETED"] },
                    { $ifNull: ["$actualStart", false] },
                    { $ifNull: ["$actualEnd", false] },
                  ],
                },
                { $subtract: ["$actualEnd", "$actualStart"] },
                0,
              ],
            },
          },

          // Count how many completed jobs actually had time tracking to get an accurate average
          jobsWithTimeTracking: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "COMPLETED"] },
                    { $ifNull: ["$actualStart", false] },
                    { $ifNull: ["$actualEnd", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        // Project the final calculated fields
        $project: {
          techName: 1,
          totalAssigned: 1,
          completed: 1,
          completionRate: {
            // (completed / totalAssigned) * 100
            $cond: [
              { $eq: ["$totalAssigned", 0] },
              0,
              {
                $multiply: [{ $divide: ["$completed", "$totalAssigned"] }, 100],
              },
            ],
          },
          avgCompletionHours: {
            // Convert average ms to hours (ms / 3600000)
            $cond: [
              { $eq: ["$jobsWithTimeTracking", 0] },
              0,
              {
                $round: [
                  {
                    $divide: [
                      { $divide: ["$totalTimeMs", "$jobsWithTimeTracking"] },
                      3600000,
                    ],
                  },
                  1,
                ],
              },
            ],
          },
        },
      },
      { $sort: { completed: -1 } }, // Sort by most completed jobs first
    ]);

    return NextResponse.json({ success: true, data: performanceStats });
  } catch (error) {
    console.error("Failed to fetch performance stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch technician performance",
        },
      },
      { status: 500 },
    );
  }
}
