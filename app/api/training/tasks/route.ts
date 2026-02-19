import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/training/tasks - Get all training tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build where clause based on filters
    const where: any = {};

    // If user is a player, only show their tasks
    if (session.user.role === 'PLAYER') {
      where.progress = {
        some: {
          userId: session.user.id,
        },
      };
    } else if (userId) {
      // Coaches/admins can filter by specific user
      where.progress = {
        some: {
          userId,
        },
      };
    }

    if (category) {
      where.category = category;
    }

    // Fetch tasks with progress information
    const tasks = await prisma.trainingTask.findMany({
      where,
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
          where: userId
            ? { userId }
            : session.user.role === 'PLAYER'
            ? { userId: session.user.id }
            : undefined,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to match frontend interface
    const transformedTasks = tasks.map((task: any) => {
      const userProgress = task.progress[0]; // Get the specific user's progress
      const now = new Date();
      const isOverdue = task.dueDate && task.dueDate < now && userProgress?.status !== 'COMPLETED';

      return {
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
      };
    });

    // Apply status filter after transformation (since status is derived)
    const filteredTasks = status
      ? transformedTasks.filter((task: any) => task.status === status)
      : transformedTasks;

    return NextResponse.json(filteredTasks);
  } catch (error) {
    console.error('Error fetching training tasks:', error);
    // Return empty array as fallback when database is unavailable
    return NextResponse.json([]);
  }
}

// POST /api/training/tasks - Create a new training task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only coaches and admins can create tasks
    if (session.user.role !== 'COACH' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      difficulty,
      dueDate,
      videoUrl,
      playId,
      assignTo, // Array of user IDs
    } = body;

    // Validate required fields
    if (!title || !description || !category || !difficulty || !assignTo?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the task
    const task = await prisma.trainingTask.create({
      data: {
        title,
        description,
        category,
        difficulty: difficulty.toUpperCase(),
        dueDate: dueDate ? new Date(dueDate) : null,
        videoUrl,
        linkedPlayId: playId,
        assignedById: session.user.id,
        progress: {
          create: assignTo.map((userId: string) => ({
            userId,
            status: 'NOT_STARTED',
            progress: 0,
          })),
        },
      },
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
      },
    });

    return NextResponse.json(
      {
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        assignedBy: task.assignedById,
        assignedByName: `${task.assignedBy.firstName} ${task.assignedBy.lastName}`,
        assignedDate: task.createdAt,
        dueDate: task.dueDate,
        difficulty: task.difficulty.toLowerCase(),
        status: 'pending',
        completionPercentage: 0,
        lastUpdated: task.createdAt,
        videoUrl: task.videoUrl,
        playId: task.linkedPlayId,
        playName: task.linkedPlay?.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating training task:', error);
    return NextResponse.json(
      { error: 'Failed to create training task' },
      { status: 500 }
    );
  }
}
