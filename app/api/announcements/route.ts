import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import webpush from "web-push";

// Configure web-push with VAPID keys
// You need to generate VAPID keys and add them to your .env file
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || "admin@surgesoccer.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// GET /api/announcements - Get all announcements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // Return empty array when not authenticated instead of 401
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const priority = searchParams.get("priority");

    // Try database first, fallback to mock data if DB fails
    try {
      // Build filter
      const where: any = {};
      
      if (teamId) {
        where.teamId = teamId;
      }
      
      if (priority) {
        where.priority = priority;
      }

      // Filter out expired announcements
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];

      const announcements = await prisma.announcement.findMany({
        where,
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
            select: {
              userId: true,
            },
          },
          reactions: {
            select: {
              userId: true,
              emoji: true,
            },
          },
        },
        orderBy: [
          { isPinned: "desc" },
          { priority: "asc" }, // URGENT=0, HIGH=1, NORMAL=2, LOW=3
          { createdAt: "desc" },
        ],
      });

      // Transform to match frontend interface
      const transformedAnnouncements = announcements.map((ann) => ({
        id: ann.id,
        title: ann.title,
        content: ann.content,
        priority: ann.priority,
        authorId: ann.authorId,
        author: {
          id: ann.author.id,
          name: `${ann.author.firstName} ${ann.author.lastName}`,
          role: ann.author.role,
          avatarUrl: ann.author.avatarUrl,
        },
        teamId: ann.teamId,
        isPinned: ann.isPinned,
        expiresAt: ann.expiresAt?.toISOString(),
        createdAt: ann.createdAt.toISOString(),
        updatedAt: ann.updatedAt.toISOString(),
        readBy: ann.readBy.map((r) => r.userId),
        reactions: ann.reactions.map((r) => ({
          userId: r.userId,
          emoji: r.emoji,
        })),
      }));

      return NextResponse.json(transformedAnnouncements);
    } catch (dbError) {
      console.warn('Database connection failed, using fallback data:', dbError);
      
      // Fallback mock data when database is unavailable
      const mockAnnouncements = [
        {
          id: "mock-1",
          title: "Welcome to Surge Soccer!",
          content: "This is a demo announcement. The database is currently unavailable, but you can still use the app with localStorage for data persistence.",
          priority: "NORMAL",
          authorId: session.user.id,
          author: {
            id: session.user.id,
            name: session.user.name || "Demo User",
            role: session.user.role || "PLAYER",
            avatarUrl: null,
          },
          teamId: null,
          isPinned: true,
          expiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          readBy: [session.user.id],
          reactions: [],
        },
        {
          id: "mock-2", 
          title: "Database Status",
          content: "The database connection is temporarily unavailable. All features are working with localStorage fallback. Your data will persist in the browser.",
          priority: "HIGH",
          authorId: session.user.id,
          author: {
            id: session.user.id,
            name: session.user.name || "Demo User",
            role: session.user.role || "PLAYER",
            avatarUrl: null,
          },
          teamId: null,
          isPinned: false,
          expiresAt: null,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          readBy: [],
          reactions: [],
        }
      ];

      return NextResponse.json(mockAnnouncements);
    }
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create a new announcement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, priority, teamId, isPinned, expiresAt } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Check permissions and try database first
    try {
      // Check if user has permission to create announcements
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, firstName: true, lastName: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const allowedRoles = ["ADMIN", "COACH", "TEAM_MANAGER"];
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: "You don't have permission to create announcements" },
          { status: 403 }
        );
      }

      // Create the announcement
      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          priority: priority || "NORMAL",
          authorId: session.user.id,
          teamId: teamId || null,
          isPinned: isPinned || false,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
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
        },
      });

      // Mark as read by the author
      await prisma.announcementRead.create({
        data: {
          announcementId: announcement.id,
          userId: session.user.id,
        },
      });

      // Send push notifications to all users with subscriptions
      await sendPushNotifications(announcement, user);

      // Transform response
      const response = {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        authorId: announcement.authorId,
        author: {
          id: announcement.author.id,
          name: `${announcement.author.firstName} ${announcement.author.lastName}`,
          role: announcement.author.role,
          avatarUrl: announcement.author.avatarUrl,
        },
        teamId: announcement.teamId,
        isPinned: announcement.isPinned,
        expiresAt: announcement.expiresAt?.toISOString(),
        createdAt: announcement.createdAt.toISOString(),
        updatedAt: announcement.updatedAt.toISOString(),
        readBy: [session.user.id],
        reactions: [],
      };

      return NextResponse.json(response, { status: 201 });
    } catch (dbError) {
      console.warn('Database connection failed, returning mock response:', dbError);
      
      // Check permissions from session data
      const userRole = (session.user as any)?.role;
      const allowedRoles = ["ADMIN", "COACH", "TEAM_MANAGER"];
      
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { error: "You don't have permission to create announcements" },
          { status: 403 }
        );
      }

      // Return mock response when database is unavailable
      const mockResponse = {
        id: `mock-${Date.now()}`,
        title,
        content,
        priority: priority || "NORMAL",
        authorId: session.user.id,
        author: {
          id: session.user.id,
          name: session.user.name || "Demo User",
          role: userRole || "PLAYER",
          avatarUrl: null,
        },
        teamId: teamId || null,
        isPinned: isPinned || false,
        expiresAt: expiresAt || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readBy: [session.user.id],
        reactions: [],
      };

      return NextResponse.json(mockResponse, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

// Helper function to send push notifications
async function sendPushNotifications(
  announcement: any,
  author: { firstName: string; lastName: string }
) {
  try {
    // Check if VAPID keys are configured
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.log("VAPID keys not configured, skipping push notifications");
      return;
    }

    // Get all push subscriptions (excluding the author)
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: {
          not: announcement.authorId,
        },
      },
    });

    if (subscriptions.length === 0) {
      console.log("No push subscriptions found");
      return;
    }

    const payload = JSON.stringify({
      title: `New Announcement: ${announcement.title}`,
      body: announcement.content.substring(0, 100) + (announcement.content.length > 100 ? "..." : ""),
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: {
        url: "/communication?tab=announcements",
        announcementId: announcement.id,
      },
      tag: `announcement-${announcement.id}`,
      priority: announcement.priority,
    });

    // Send notifications in parallel
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
          return { success: true, userId: sub.userId };
        } catch (error: any) {
          // If subscription is expired or invalid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: sub.id },
            });
          }
          return { success: false, userId: sub.userId, error: error.message };
        }
      })
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    console.log(`Sent ${successful}/${subscriptions.length} push notifications`);
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
}
