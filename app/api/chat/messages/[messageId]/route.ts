import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// DELETE /api/chat/messages/[messageId] - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;

    // Get the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chatRoom: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is the sender or an admin/coach
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const canDelete =
      message.senderId === session.user.id ||
      user?.role === "ADMIN" ||
      user?.role === "COACH";

    if (!canDelete) {
      return NextResponse.json({ error: "Not authorized to delete this message" }, { status: 403 });
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

// PATCH /api/chat/messages/[messageId] - Pin/unpin a message
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;
    const body = await request.json();
    const { isPinned } = body;

    // Get the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user can pin (admin or coach)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const canPin = user?.role === "ADMIN" || user?.role === "COACH";

    if (!canPin) {
      return NextResponse.json({ error: "Not authorized to pin messages" }, { status: 403 });
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isPinned },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedMessage.id,
      content: updatedMessage.content,
      senderId: updatedMessage.senderId,
      chatRoomId: updatedMessage.chatRoomId,
      createdAt: updatedMessage.createdAt.toISOString(),
      updatedAt: updatedMessage.updatedAt.toISOString(),
      isPinned: updatedMessage.isPinned,
      readBy: updatedMessage.readBy,
      mentions: updatedMessage.mentions,
      sender: {
        id: updatedMessage.sender.id,
        name: `${updatedMessage.sender.firstName} ${updatedMessage.sender.lastName}`,
        avatarUrl: updatedMessage.sender.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
