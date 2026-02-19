import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

// This endpoint creates the super admin account
// Access: GET /api/setup-admin?secret=surge2024
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Basic protection - require secret to run
  if (secret !== "surge2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const password = await hash("Call317470admin", 10);

    const admin = await prisma.user.upsert({
      where: { email: "coxjuston04@gmail.com" },
      update: {
        password: password,
        role: "ADMIN",
        firstName: "Juston",
        lastName: "Cox",
      },
      create: {
        email: "coxjuston04@gmail.com",
        password: password,
        firstName: "Juston",
        lastName: "Cox",
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Super admin account created/updated",
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      note: "Please log out and log back in to refresh your session with the new name."
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    );
  }
}
