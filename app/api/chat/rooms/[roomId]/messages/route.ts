import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// GET /api/chat/rooms/[roomId]/messages - Get messages for a chat room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    // Verify user is a participant of this room
    const participant = await prisma.chatRoomParticipant.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    // Get messages with attachments
    const messages = await prisma.message.findMany({
      where: {
        chatRoomId: roomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Update lastReadAt for the participant
    await prisma.chatRoomParticipant.update({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomId,
          userId: session.user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // Format messages with attachments
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      chatRoomId: msg.chatRoomId,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
      isPinned: msg.isPinned,
      readBy: msg.readBy,
      mentions: msg.mentions,
      sender: {
        id: msg.sender.id,
        name: `${msg.sender.firstName} ${msg.sender.lastName}`,
        avatarUrl: msg.sender.avatarUrl,
      },
      attachments: msg.attachments.map((att: { id: string; fileName: string; fileType: string; fileSize: number; fileUrl: string; thumbnailUrl: string | null }) => ({
        id: att.id,
        fileName: att.fileName,
        fileType: att.fileType,
        fileSize: att.fileSize,
        fileUrl: att.fileUrl,
        thumbnailUrl: att.thumbnailUrl,
      })),
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Helper function to save uploaded file
async function saveUploadedFile(file: File): Promise<{ fileName: string; fileUrl: string; fileSize: number; fileType: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create unique filename
  const ext = path.extname(file.name);
  const uniqueName = `${randomUUID()}${ext}`;
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "chat");
  await mkdir(uploadsDir, { recursive: true });
  
  // Save file
  const filePath = path.join(uploadsDir, uniqueName);
  await writeFile(filePath, buffer);
  
  return {
    fileName: file.name,
    fileUrl: `/uploads/chat/${uniqueName}`,
    fileSize: file.size,
    fileType: file.type,
  };
}

// POST /api/chat/rooms/[roomId]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    
    // Check content type to determine how to parse the request
    const contentType = request.headers.get("content-type") || "";
    
    let content = "";
    let mentions: string[] = [];
    const attachmentData: { fileName: string; fileUrl: string; fileSize: number; fileType: string }[] = [];
    
    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data (with attachments)
      const formData = await request.formData();
      content = (formData.get("content") as string) || "";
      
      const mentionsStr = formData.get("mentions") as string;
      if (mentionsStr) {
        try {
          mentions = JSON.parse(mentionsStr);
        } catch {
          mentions = [];
        }
      }
      
      // Process attachment files
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("attachment_") && value instanceof File) {
          const savedFile = await saveUploadedFile(value);
          attachmentData.push(savedFile);
        }
      }
    } else {
      // Handle JSON request (text only)
      const body = await request.json();
      content = body.content || "";
      mentions = body.mentions || [];
    }

    // Require either content or attachments
    if (!content.trim() && attachmentData.length === 0) {
      return NextResponse.json({ error: "Message content or attachment required" }, { status: 400 });
    }

    // Verify user is a participant
    const participant = await prisma.chatRoomParticipant.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    // Create the message with attachments
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        chatRoomId: roomId,
        mentions,
        readBy: [session.user.id],
        attachments: {
          create: attachmentData.map(att => ({
            fileName: att.fileName,
            fileType: att.fileType,
            fileSize: att.fileSize,
            fileUrl: att.fileUrl,
          })),
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
    });

    // Update the chat room's updatedAt timestamp
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    // Update sender's lastReadAt
    await prisma.chatRoomParticipant.update({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomId,
          userId: session.user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      chatRoomId: message.chatRoomId,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      isPinned: message.isPinned,
      readBy: message.readBy,
      mentions: message.mentions,
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        avatarUrl: message.sender.avatarUrl,
      },
      attachments: message.attachments.map((att: { id: string; fileName: string; fileType: string; fileSize: number; fileUrl: string; thumbnailUrl: string | null }) => ({
        id: att.id,
        fileName: att.fileName,
        fileType: att.fileType,
        fileSize: att.fileSize,
        fileUrl: att.fileUrl,
        thumbnailUrl: att.thumbnailUrl,
      })),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
