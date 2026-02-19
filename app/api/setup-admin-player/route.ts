import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// This endpoint creates a Player record for the admin account
// so they can receive player features (stats, assignments, etc.)
// Access: GET /api/setup-admin-player?secret=surge2024
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Basic protection - require secret to run
  if (secret !== "surge2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: "coxjuston04@gmail.com" },
      include: { player: true },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    // Check if player record already exists
    if (adminUser.player) {
      return NextResponse.json({
        success: true,
        message: "Player record already exists for admin",
        playerId: adminUser.player.id,
        jerseyNumber: adminUser.player.jerseyNumber,
        position: adminUser.player.position,
      });
    }

    // Create Player record for admin
    const player = await prisma.player.create({
      data: {
        userId: adminUser.id,
        jerseyNumber: 10,
        position: "Midfielder",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Player record created for admin account",
      playerId: player.id,
      userId: adminUser.id,
      name: `${adminUser.firstName} ${adminUser.lastName}`,
      jerseyNumber: player.jerseyNumber,
      position: player.position,
      note: "You can now receive player features like stats tracking and coach assignments.",
    });
  } catch (error) {
    console.error("Error creating player record:", error);
    return NextResponse.json(
      { error: "Failed to create player record" },
      { status: 500 }
    );
  }
}
