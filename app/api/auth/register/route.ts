import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, role, jerseyNumber } = body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Create role-specific profile based on user role
    switch (role) {
      case "PLAYER":
        await prisma.player.create({
          data: {
            userId: user.id,
            jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
            position: "Player",
          },
        });
        break;
      case "COACH":
        await prisma.coach.create({
          data: {
            userId: user.id,
          },
        });
        break;
      case "EQUIPMENT_MANAGER":
        await prisma.equipmentManager.create({
          data: {
            userId: user.id,
          },
        });
        break;
      case "FAMILY":
        // Family members need to be associated with a player
        // For now, just create the user, association will be done later
        break;
      default:
        // Admin users don't need additional profiles
        break;
    }

    return NextResponse.json(
      { 
        message: "User registered successfully", 
        userId: user.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
