import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET a specific frame
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playId: string; frameId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { frameId } = await params;

    const frame = await (prisma as any).playFrame.findUnique({
      where: { id: frameId },
    });

    if (!frame) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    return NextResponse.json({ frame });
  } catch (error) {
    console.error("Failed to fetch frame:", error);
    return NextResponse.json(
      { error: "Failed to fetch frame" },
      { status: 500 }
    );
  }
}

// PUT - Update a specific frame
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ playId: string; frameId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { frameId } = await params;
    const body = await request.json();
    const { duration, positions, lines, annotations, ballPosition } = body;

    const frame = await (prisma as any).playFrame.update({
      where: { id: frameId },
      data: {
        ...(duration !== undefined && { duration }),
        ...(positions !== undefined && { positions }),
        ...(lines !== undefined && { lines }),
        ...(annotations !== undefined && { annotations }),
        ...(ballPosition !== undefined && { ballPosition }),
      },
    });

    return NextResponse.json({ frame });
  } catch (error) {
    console.error("Failed to update frame:", error);
    return NextResponse.json(
      { error: "Failed to update frame" },
      { status: 500 }
    );
  }
}

// DELETE a specific frame
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ playId: string; frameId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playId, frameId } = await params;

    // Delete the frame
    await (prisma as any).playFrame.delete({
      where: { id: frameId },
    });

    // Reorder remaining frames
    const remainingFrames = await (prisma as any).playFrame.findMany({
      where: { playId },
      orderBy: { frameNumber: "asc" },
    });

    // Update frame numbers to be sequential
    await prisma.$transaction(
      remainingFrames.map((frame: any, index: number) =>
        (prisma as any).playFrame.update({
          where: { id: frame.id },
          data: { frameNumber: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete frame:", error);
    return NextResponse.json(
      { error: "Failed to delete frame" },
      { status: 500 }
    );
  }
}
