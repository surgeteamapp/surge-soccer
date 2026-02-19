import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/videos - Get all videos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};

    // Filter by category
    if (category && category !== 'all') {
      where.category = category;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        notes: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        assignments: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            assignedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST /api/videos - Create a new video
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is coach or admin
    const userRole = (session.user as any).role;
    if (userRole !== 'COACH' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only coaches and admins can upload videos' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      youtubeId,
      externalUrl,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      thumbnail,
      category,
      tags,
      isPublic,
      duration,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // At least one video source is required
    if (!youtubeId && !externalUrl && !fileUrl) {
      return NextResponse.json({ error: 'A video source (YouTube, external link, or file) is required' }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        youtubeId,
        externalUrl,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        thumbnail: thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null),
        category: category || 'all',
        tags: tags || [],
        isPublic: isPublic ?? true,
        duration,
        uploaderId: session.user.id,
      },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        notes: true,
        assignments: true,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
