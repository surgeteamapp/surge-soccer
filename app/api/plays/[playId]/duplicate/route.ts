import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST - Duplicate a play with all its frames
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ playId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playId } = await params;
    const body = await request.json();
    const { newName } = body;

    // Get the original play with frames
    const originalPlay = await prisma.play.findUnique({
      where: { id: playId },
      include: {
        playFrames: {
          orderBy: { frameNumber: "asc" },
        },
      },
    });

    if (!originalPlay) {
      return NextResponse.json({ error: "Play not found" }, { status: 404 });
    }

    // Create the duplicated play
    const duplicatedPlay = await prisma.play.create({
      data: {
        name: newName || `${originalPlay.name} (Copy)`,
        description: originalPlay.description,
        category: originalPlay.category,
        tags: originalPlay.tags,
        playbookId: originalPlay.playbookId,
        teamId: originalPlay.teamId,
        createdById: session.user.id,
        positionData: originalPlay.positionData,
        isPublished: false,
        playFrames: {
          create: (originalPlay as any).playFrames.map((frame: any) => ({
            frameNumber: frame.frameNumber,
            duration: frame.duration,
            positions: frame.positions,
            lines: frame.lines,
            annotations: frame.annotations,
            ballPosition: frame.ballPosition,
          })),
        },
      },
      include: {
        playFrames: {
          orderBy: { frameNumber: "asc" },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({ play: duplicatedPlay }, { status: 201 });
  } catch (error) {
    console.error("Failed to duplicate play:", error);
    return NextResponse.json(
      { error: "Failed to duplicate play" },
      { status: 500 }
    );
  }
}
