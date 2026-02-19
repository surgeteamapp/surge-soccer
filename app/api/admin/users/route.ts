import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

// Helper function to verify admin access
async function verifyAdmin() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (currentUser?.role !== "ADMIN") {
    return { error: "Forbidden", status: 403 };
  }

  return { success: true };
}

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Fetch all users with more details
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phoneNumber: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map users to include derived fields
    const usersWithStatus = users.map(user => ({
      ...user,
      emailVerified: user.createdAt, // Assume verified if exists
      lastLogin: null
    }));

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { email, firstName, lastName, role, password, phoneNumber } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !role || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, firstName, lastName, role, password" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    // Validate role
    const validRoles = ["ADMIN", "COACH", "TEAM_MANAGER", "EQUIPMENT_MANAGER", "PLAYER", "FAMILY"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    // Create role-specific profile based on user role
    switch (role) {
      case "PLAYER":
        await prisma.player.create({
          data: {
            userId: newUser.id,
            position: "Player",
          },
        });
        break;
      case "COACH":
        await prisma.coach.create({
          data: {
            userId: newUser.id,
          },
        });
        break;
      case "EQUIPMENT_MANAGER":
        await prisma.equipmentManager.create({
          data: {
            userId: newUser.id,
          },
        });
        break;
    }

    return NextResponse.json({ user: newUser, message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
