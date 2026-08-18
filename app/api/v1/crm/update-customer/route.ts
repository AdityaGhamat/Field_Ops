import { dbConnect } from "@/lib/database/db";
import { Customer } from "@/lib/schema/customer";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { customerId, ...updateData } = body;

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required" },
        { status: 400 },
      );
    }

    // $set will safely update only the fields provided in updateData
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updateData },
      { new: true, runValidators: true }, // Return the updated doc and enforce schema constraints
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error("Failed to update customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update customer" },
      },
      { status: 500 },
    );
  }
}
