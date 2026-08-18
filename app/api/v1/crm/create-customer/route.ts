import { dbConnect } from "@/lib/database/db";
import { Customer } from "@/lib/schema/customer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      name,
      email,
      phone,
      companyName,
      billingAddress,
      serviceLocations = [],
      notes,
    } = body;

    // Prevent duplicate emails
    const existingCustomer = await Customer.findOne({ email }).lean();
    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "A customer with this email already exists",
        },
        { status: 400 },
      );
    }

    const newCustomer = await Customer.create({
      name,
      email,
      phone,
      companyName,
      billingAddress,
      serviceLocations, // Expects an array of { label, addressString, location: { coordinates } }
      notes,
      isActive: true,
    });

    return NextResponse.json(
      { success: true, data: newCustomer },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create customer" },
      },
      { status: 500 },
    );
  }
}
