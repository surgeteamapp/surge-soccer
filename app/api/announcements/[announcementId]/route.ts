import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// DELETE /api/announcements/[announcementId] - Delete an announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { announcementId } = await params;

    // Get the announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { authorId: true },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check permissions - only author or admin can delete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (announcement.authorId !== session.user.id && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to delete this announcement" },
        { status: 403 }
      );
    }

    // Delete the announcement
    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}

// PATCH /api/announcements/[announcementId] - Update an announcement (pin/unpin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { announcementId } = await params;
    const body = await request.json();

    // Get the announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check permissions - only author, admin, coach, or team manager can update
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const allowedRoles = ["ADMIN", "COACH", "TEAM_MANAGER"];
    if (
      announcement.authorId !== session.user.id &&
      !allowedRoles.includes(user?.role || "")
    ) {
      return NextResponse.json(
        { error: "You don't have permission to update this announcement" },
        { status: 403 }
      );
    }

    // Update the announcement
    const updateData: any = {};
    
    if (typeof body.isPinned === "boolean") {
      updateData.isPinned = body.isPinned;
    }
    
    if (body.title) {
      updateData.title = body.title;
    }
    
    if (body.content) {
      updateData.content = body.content;
    }
    
    if (body.priority) {
      updateData.priority = body.priority;
    }

    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatarUrl: true,
          },
        },
        readBy: {
          select: { userId: true },
        },
        reactions: {
          select: { userId: true, emoji: true },
        },
      },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      content: updated.content,
      priority: updated.priority,
      authorId: updated.authorId,
      author: {
        id: updated.author.id,
        name: `${updated.author.firstName} ${updated.author.lastName}`,
        role: updated.author.role,
        avatarUrl: updated.author.avatarUrl,
      },
      teamId: updated.teamId,
      isPinned: updated.isPinned,
      expiresAt: updated.expiresAt?.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      readBy: updated.readBy.map((r) => r.userId),
      reactions: updated.reactions.map((r) => ({
        userId: r.userId,
        emoji: r.emoji,
      })),
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}
