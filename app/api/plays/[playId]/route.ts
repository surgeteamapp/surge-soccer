import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET a specific play with all frames
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playId } = await params;

    const play = await prisma.play.findUnique({
      where: { id: playId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        playFrames: {
          orderBy: { frameNumber: "asc" },
        },
        playbook: {
          select: { id: true, name: true },
        },
      },
    });

    if (!play) {
      return NextResponse.json({ error: "Play not found" }, { status: 404 });
    }

    return NextResponse.json({
      play: {
        id: play.id,
        name: play.name,
        description: play.description,
        category: play.category,
        tags: play.tags,
        isPublished: play.isPublished,
        createdAt: play.createdAt,
        updatedAt: play.updatedAt,
        authorId: play.createdById,
        authorName: `${play.createdBy.firstName} ${play.createdBy.lastName}`,
        playbookId: play.playbookId,
        playbookName: play.playbook?.name,
        frames: play.playFrames,
      },
    });
  } catch (error) {
    console.error("Failed to fetch play:", error);
    return NextResponse.json(
      { error: "Failed to fetch play" },
      { status: 500 }
    );
  }
}

// PUT - Update a play
export async function PUT(
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
    const { name, description, category, tags, isPublished, playbookId, frames } = body;

    // Update play metadata
    const play = await prisma.play.update({
      where: { id: playId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(tags && { tags }),
        ...(isPublished !== undefined && { isPublished }),
        ...(playbookId !== undefined && { playbookId }),
      },
    });

    // Update frames if provided
    if (frames && Array.isArray(frames)) {
      // Delete existing frames
      await prisma.playFrame.deleteMany({
        where: { playId },
      });

      // Create new frames
      await prisma.playFrame.createMany({
        data: frames.map((frame: any, index: number) => ({
          playId,
          frameNumber: frame.frameNumber ?? index,
          duration: frame.duration ?? 1.0,
          positions: frame.positions ?? [],
          lines: frame.lines ?? [],
          annotations: frame.annotations ?? [],
          ballPosition: frame.ballPosition ?? null,
        })),
      });
    }

    // Fetch updated play with frames
    const updatedPlay = await prisma.play.findUnique({
      where: { id: playId },
      include: {
        playFrames: {
          orderBy: { frameNumber: "asc" },
        },
      },
    });

    return NextResponse.json({ play: updatedPlay });
  } catch (error) {
    console.error("Failed to update play:", error);
    return NextResponse.json(
      { error: "Failed to update play" },
      { status: 500 }
    );
  }
}

// DELETE a play
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ playId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playId } = await params;

    await prisma.play.delete({
      where: { id: playId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete play:", error);
    return NextResponse.json(
      { error: "Failed to delete play" },
      { status: 500 }
    );
  }
}
