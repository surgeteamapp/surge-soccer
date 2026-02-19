import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET a specific playbook
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playbookId: string }> }
) {
  try {
    const { playbookId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore - Prisma client may need regeneration
    const playbook = await (prisma as any).playbook.findUnique({
      where: { id: playbookId },
      include: {
        plays: {
          include: {
            createdBy: {
              select: { id: true, firstName: true, lastName: true },
            },
            playVersions: {
              orderBy: { versionNumber: "desc" },
            },
          },
        },
      },
    });

    if (!playbook) {
      return NextResponse.json(
        { error: "Playbook not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ playbook });
  } catch (error) {
    console.error("Failed to fetch playbook:", error);
    return NextResponse.json(
      { error: "Failed to fetch playbook" },
      { status: 500 }
    );
  }
}

// PUT - Update a playbook
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ playbookId: string }> }
) {
  try {
    const { playbookId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    // @ts-ignore - Prisma client may need regeneration
    const playbook = await (prisma as any).playbook.update({
      where: { id: playbookId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ playbook });
  } catch (error) {
    console.error("Failed to update playbook:", error);
    return NextResponse.json(
      { error: "Failed to update playbook" },
      { status: 500 }
    );
  }
}

// DELETE a playbook
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ playbookId: string }> }
) {
  try {
    const { playbookId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore - Prisma client may need regeneration
    await (prisma as any).playbook.delete({
      where: { id: playbookId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete playbook:", error);
    return NextResponse.json(
      { error: "Failed to delete playbook" },
      { status: 500 }
    );
  }
}
