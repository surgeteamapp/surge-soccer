import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/videos/[id]/markers - List all markers for a video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: videoId } = await params;

    const markers = await prisma.filmStudyMarker.findMany({
      where: { videoId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Transform to match frontend expected format
    const formattedMarkers = markers.map((marker) => ({
      id: marker.id,
      timestamp: marker.timestamp,
      title: marker.title,
      content: marker.content || '',
      type: marker.type.toLowerCase(),
      color: marker.color,
      drawingData: marker.drawingData,
      authorId: marker.userId,
      authorName: `${marker.author.firstName} ${marker.author.lastName}`,
      authorRole: marker.author.role,
      createdAt: marker.createdAt,
      replies: marker.replies.map((reply) => ({
        id: reply.id,
        markerId: reply.markerId,
        content: reply.content,
        authorId: reply.userId,
        authorName: `${reply.author.firstName} ${reply.author.lastName}`,
        createdAt: reply.createdAt,
      })),
    }));

    return NextResponse.json(formattedMarkers);
  } catch (error) {
    console.error('Error fetching markers:', error);
    return NextResponse.json({ error: 'Failed to fetch markers' }, { status: 500 });
  }
}

// POST /api/videos/[id]/markers - Create a new marker
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: videoId } = await params;
    const body = await request.json();
    const { timestamp, title, content, type, color, drawingData } = body;

    if (timestamp === undefined || !title) {
      return NextResponse.json({ error: 'Timestamp and title are required' }, { status: 400 });
    }

    // Verify video exists
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Map type string to enum
    const typeMap: Record<string, 'NOTE' | 'HIGHLIGHT' | 'QUESTION' | 'DRILL'> = {
      note: 'NOTE',
      highlight: 'HIGHLIGHT',
      question: 'QUESTION',
      drill: 'DRILL',
    };

    const colorMap: Record<string, string> = {
      note: '#22c55e',
      highlight: '#f59e0b',
      question: '#3b82f6',
      drill: '#a855f7',
    };

    const markerType = typeMap[type?.toLowerCase()] || 'NOTE';
    const markerColor = color || colorMap[type?.toLowerCase()] || '#22c55e';

    const marker = await prisma.filmStudyMarker.create({
      data: {
        videoId,
        userId: session.user.id,
        timestamp: Math.floor(timestamp),
        title,
        content: content || '',
        type: markerType,
        color: markerColor,
        drawingData: drawingData || null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        replies: true,
      },
    });

    // Format response
    const formattedMarker = {
      id: marker.id,
      timestamp: marker.timestamp,
      title: marker.title,
      content: marker.content || '',
      type: marker.type.toLowerCase(),
      color: marker.color,
      drawingData: marker.drawingData,
      authorId: marker.userId,
      authorName: `${marker.author.firstName} ${marker.author.lastName}`,
      authorRole: marker.author.role,
      createdAt: marker.createdAt,
      replies: [],
    };

    return NextResponse.json(formattedMarker, { status: 201 });
  } catch (error) {
    console.error('Error creating marker:', error);
    return NextResponse.json({ error: 'Failed to create marker' }, { status: 500 });
  }
}
