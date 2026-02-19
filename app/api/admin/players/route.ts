import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all users who have a Player record (regardless of role)
    const playersWithUsers = await prisma.player.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        jerseyNumber: 'asc'
      }
    });

    // Format player data with proper names
    const formattedPlayers = playersWithUsers.map((p, index) => {
      const firstName = p.user.firstName || '';
      const lastName = p.user.lastName || '';
      
      // Properly format name: capitalize first letter of each part
      const formatName = (name: string) => 
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      
      const fullName = firstName && lastName 
        ? `${formatName(firstName)} ${formatName(lastName)}`
        : firstName 
          ? formatName(firstName)
          : p.user.email?.split('@')[0] || 'Unknown';

      return {
        id: p.user.id,
        playerId: p.id,
        email: p.user.email,
        name: fullName,
        jerseyNumber: p.jerseyNumber || index + 1,
        position: p.position || 'Player',
      };
    });

    return NextResponse.json({ players: formattedPlayers });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}
