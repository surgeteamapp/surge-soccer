import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/chat/rooms - Get all chat rooms for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get chat rooms where the user is a participant
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format the response
    const formattedRooms = chatRooms.map((room) => {
      const lastMessage = room.messages[0];
      const otherParticipants = room.participants.filter(
        (p) => p.userId !== session.user.id
      );
      
      // For direct messages, use the other user's name as the room name
      let roomName = room.name;
      if (room.type === "DIRECT" && otherParticipants.length > 0) {
        const otherUser = otherParticipants[0].user;
        roomName = `${otherUser.firstName} ${otherUser.lastName}`;
      }

      // Calculate unread count
      const userParticipant = room.participants.find(
        (p) => p.userId === session.user.id
      );
      const unreadCount = lastMessage && userParticipant
        ? new Date(lastMessage.createdAt) > new Date(userParticipant.lastReadAt)
          ? 1
          : 0
        : 0;

      return {
        id: room.id,
        name: roomName,
        type: room.type,
        teamId: room.teamId,
        unreadCount,
        participants: room.participants.map((p) => ({
          id: p.user.id,
          name: `${p.user.firstName} ${p.user.lastName}`,
          avatarUrl: p.user.avatarUrl,
        })),
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              sender: `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`,
              timestamp: lastMessage.createdAt.toISOString(),
            }
          : undefined,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(formattedRooms);
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat rooms" },
      { status: 500 }
    );
  }
}

// POST /api/chat/rooms - Create a new chat room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, participantIds, teamId } = body;

    // For direct messages, check if a room already exists between these users
    if (type === "DIRECT" && participantIds?.length === 1) {
      const otherUserId = participantIds[0];
      
      // Find existing DM room
      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          type: "DIRECT",
          AND: [
            {
              participants: {
                some: {
                  userId: session.user.id,
                },
              },
            },
            {
              participants: {
                some: {
                  userId: otherUserId,
                },
              },
            },
          ],
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (existingRoom) {
        const otherParticipant = existingRoom.participants.find(
          (p) => p.userId !== session.user.id
        );
        return NextResponse.json({
          id: existingRoom.id,
          name: otherParticipant
            ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
            : existingRoom.name,
          type: existingRoom.type,
          isExisting: true,
        });
      }
    }

    // Create new chat room
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name: name || "New Chat",
        type: type || "DIRECT",
        teamId: teamId || null,
        participants: {
          create: [
            { userId: session.user.id },
            ...(participantIds || []).map((id: string) => ({ userId: id })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // For direct messages, use the other user's name
    let roomName = chatRoom.name;
    if (chatRoom.type === "DIRECT") {
      const otherParticipant = chatRoom.participants.find(
        (p) => p.userId !== session.user.id
      );
      if (otherParticipant) {
        roomName = `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`;
      }
    }

    return NextResponse.json({
      id: chatRoom.id,
      name: roomName,
      type: chatRoom.type,
      participants: chatRoom.participants.map((p) => ({
        id: p.user.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        avatarUrl: p.user.avatarUrl,
      })),
      isExisting: false,
    });
  } catch (error) {
    console.error("Error creating chat room:", error);
    return NextResponse.json(
      { error: "Failed to create chat room" },
      { status: 500 }
    );
  }
}
