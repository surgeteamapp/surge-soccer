import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET all frames for a play
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

    const frames = await (prisma as any).playFrame.findMany({
      where: { playId },
      orderBy: { frameNumber: "asc" },
    });

    return NextResponse.json({ frames });
  } catch (error) {
    console.error("Failed to fetch frames:", error);
    return NextResponse.json(
      { error: "Failed to fetch frames" },
      { status: 500 }
    );
  }
}

// POST - Create a new frame
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
    const { frameNumber, duration, positions, lines, annotations, ballPosition } = body;

    // Get the next frame number if not provided
    let nextFrameNumber = frameNumber;
    if (nextFrameNumber === undefined) {
      const lastFrame = await (prisma as any).playFrame.findFirst({
        where: { playId },
        orderBy: { frameNumber: "desc" },
      });
      nextFrameNumber = lastFrame ? lastFrame.frameNumber + 1 : 0;
    }

    const frame = await (prisma as any).playFrame.create({
      data: {
        playId,
        frameNumber: nextFrameNumber,
        duration: duration || 1.0,
        positions: positions || [],
        lines: lines || [],
        annotations: annotations || [],
        ballPosition: ballPosition || null,
      },
    });

    return NextResponse.json({ frame }, { status: 201 });
  } catch (error) {
    console.error("Failed to create frame:", error);
    return NextResponse.json(
      { error: "Failed to create frame" },
      { status: 500 }
    );
  }
}

// PUT - Update multiple frames (for reordering)
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
    const { frames } = body;

    // Update all frames in a transaction
    await prisma.$transaction(
      frames.map((frame: any) =>
        (prisma as any).playFrame.update({
          where: { id: frame.id },
          data: {
            frameNumber: frame.frameNumber,
            duration: frame.duration,
            positions: frame.positions,
            lines: frame.lines,
            annotations: frame.annotations,
            ballPosition: frame.ballPosition,
          },
        })
      )
    );

    // Fetch updated frames
    const updatedFrames = await (prisma as any).playFrame.findMany({
      where: { playId },
      orderBy: { frameNumber: "asc" },
    });

    return NextResponse.json({ frames: updatedFrames });
  } catch (error) {
    console.error("Failed to update frames:", error);
    return NextResponse.json(
      { error: "Failed to update frames" },
      { status: 500 }
    );
  }
}
