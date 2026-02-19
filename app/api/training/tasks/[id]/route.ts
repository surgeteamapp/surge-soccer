import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/training/tasks/[id] - Get a specific training task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const task = await prisma.trainingTask.findUnique({
      where: { id },
      include: {
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        linkedPlay: {
          select: {
            id: true,
            name: true,
          },
        },
        progress: {
          where:
            session.user.role === 'PLAYER'
              ? { userId: session.user.id }
              : undefined,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if player has access to this task
    if (session.user.role === 'PLAYER') {
      const hasAccess = task.progress.some((p: any) => p.userId === session.user.id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const userProgress = task.progress[0];
    const now = new Date();
    const isOverdue =
      task.dueDate && task.dueDate < now && userProgress?.status !== 'COMPLETED';

    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      assignedBy: task.assignedById,
      assignedByName: `${task.assignedBy.firstName} ${task.assignedBy.lastName}`,
      assignedDate: task.createdAt,
      dueDate: task.dueDate,
      difficulty: task.difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
      status: isOverdue
        ? 'overdue'
        : userProgress?.status === 'COMPLETED'
        ? 'completed'
        : userProgress?.status === 'IN_PROGRESS'
        ? 'in_progress'
        : 'pending',
      completionPercentage: userProgress?.progress || 0,
      lastUpdated: userProgress?.updatedAt || task.createdAt,
      videoUrl: task.videoUrl || undefined,
      playId: task.linkedPlayId || undefined,
      playName: task.linkedPlay?.name || undefined,
      progress: task.progress.map((p: { userId: string; user: { firstName: string; lastName: string }; status: string; progress: number; updatedAt: Date }) => ({
        userId: p.userId,
        userName: `${p.user.firstName} ${p.user.lastName}`,
        status: p.status,
        progress: p.progress,
        updatedAt: p.updatedAt,
      })),
    };

    return NextResponse.json(transformedTask);
  } catch (error) {
    console.error('Error fetching training task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training task' },
      { status: 500 }
    );
  }
}

// PATCH /api/training/tasks/[id] - Update task progress
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { progress, userId } = body;

    // Validate progress value
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Progress must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Determine which user's progress to update
    const targetUserId =
      session.user.role === 'PLAYER' ? session.user.id : userId || session.user.id;

    // Players can only update their own progress
    if (session.user.role === 'PLAYER' && targetUserId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if task exists
    const task = await prisma.trainingTask.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Determine new status based on progress
    const newStatus = progress >= 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

    // Update or create progress record
    const updatedProgress = await prisma.trainingProgress.upsert({
      where: {
        userId_taskId: {
          userId: targetUserId,
          taskId: id,
        },
      },
      update: {
        progress,
        status: newStatus,
      },
      create: {
        userId: targetUserId,
        taskId: id,
        progress,
        status: newStatus,
      },
      include: {
        task: {
          include: {
            assignedBy: true,
            linkedPlay: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      progress: updatedProgress.progress,
      status: updatedProgress.status,
    });
  } catch (error) {
    console.error('Error updating task progress:', error);
    return NextResponse.json(
      { error: 'Failed to update task progress' },
      { status: 500 }
    );
  }
}

// DELETE /api/training/tasks/[id] - Delete a training task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Only coaches and admins can delete tasks
    if (session.user.role !== 'COACH' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the task (progress records will be deleted automatically due to cascade)
    await prisma.trainingTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting training task:', error);
    return NextResponse.json(
      { error: 'Failed to delete training task' },
      { status: 500 }
    );
  }
}
