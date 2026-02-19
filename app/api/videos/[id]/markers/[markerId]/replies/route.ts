import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/videos/[id]/markers/[markerId]/replies - Add a reply to a marker
export async function POST(
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
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Verify marker exists
    const marker = await prisma.filmStudyMarker.findUnique({
      where: { id: markerId },
    });

    if (!marker) {
      return NextResponse.json({ error: 'Marker not found' }, { status: 404 });
    }

    const reply = await prisma.filmStudyMarkerReply.create({
      data: {
        markerId,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Format response
    const formattedReply = {
      id: reply.id,
      markerId: reply.markerId,
      content: reply.content,
      authorId: reply.userId,
      authorName: `${reply.author.firstName} ${reply.author.lastName}`,
      createdAt: reply.createdAt,
    };

    return NextResponse.json(formattedReply, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}

// DELETE /api/videos/[id]/markers/[markerId]/replies - Delete a reply
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; markerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const replyId = searchParams.get('replyId');

    if (!replyId) {
      return NextResponse.json({ error: 'Reply ID is required' }, { status: 400 });
    }

    // Verify reply exists
    const reply = await prisma.filmStudyMarkerReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // Only allow author or admin/coach to delete
    const userRole = (session.user as any).role;
    if (reply.userId !== session.user.id && !['ADMIN', 'COACH'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.filmStudyMarkerReply.delete({
      where: { id: replyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 });
  }
}
