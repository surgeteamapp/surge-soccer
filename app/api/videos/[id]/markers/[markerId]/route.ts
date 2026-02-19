import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PUT /api/videos/[id]/markers/[markerId] - Update a marker
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; markerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { markerId } = await params;
    const body = await request.json();
    const { title, content, type, color, drawingData } = body;

    // Verify marker exists and user owns it
    const existingMarker = await prisma.filmStudyMarker.findUnique({
      where: { id: markerId },
    });

    if (!existingMarker) {
      return NextResponse.json({ error: 'Marker not found' }, { status: 404 });
    }

    // Only allow author or admin/coach to update
    const userRole = (session.user as any).role;
    if (existingMarker.userId !== session.user.id && !['ADMIN', 'COACH'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Map type string to enum if provided
    const typeMap: Record<string, 'NOTE' | 'HIGHLIGHT' | 'QUESTION' | 'DRILL'> = {
      note: 'NOTE',
      highlight: 'HIGHLIGHT',
      question: 'QUESTION',
      drill: 'DRILL',
    };

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = typeMap[type.toLowerCase()] || existingMarker.type;
    if (color !== undefined) updateData.color = color;
    if (drawingData !== undefined) updateData.drawingData = drawingData;

    const marker = await prisma.filmStudyMarker.update({
      where: { id: markerId },
      data: updateData,
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
      replies: marker.replies.map((reply: any) => ({
        id: reply.id,
        markerId: reply.markerId,
        content: reply.content,
        authorId: reply.userId,
        authorName: `${reply.author.firstName} ${reply.author.lastName}`,
        createdAt: reply.createdAt,
      })),
    };

    return NextResponse.json(formattedMarker);
  } catch (error) {
    console.error('Error updating marker:', error);
    return NextResponse.json({ error: 'Failed to update marker' }, { status: 500 });
  }
}

// DELETE /api/videos/[id]/markers/[markerId] - Delete a marker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; markerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { markerId } = await params;

    // Verify marker exists
    const existingMarker = await prisma.filmStudyMarker.findUnique({
      where: { id: markerId },
    });

    if (!existingMarker) {
      return NextResponse.json({ error: 'Marker not found' }, { status: 404 });
    }

    // Only allow author or admin/coach to delete
    const userRole = (session.user as any).role;
    if (existingMarker.userId !== session.user.id && !['ADMIN', 'COACH'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.filmStudyMarker.delete({
      where: { id: markerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting marker:', error);
    return NextResponse.json({ error: 'Failed to delete marker' }, { status: 500 });
  }
}
