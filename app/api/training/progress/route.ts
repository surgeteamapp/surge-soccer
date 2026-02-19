import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/training/progress - Get player progress data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Determine which users to fetch progress for
    let userIds: string[] = [];

    if (session.user.role === 'PLAYER') {
      // Players can only see their own progress
      userIds = [session.user.id];
    } else if (userId) {
      // Coaches/admins can request specific user
      userIds = [userId];
    } else {
      // Coaches/admins get all players if no userId specified
      const players = await prisma.user.findMany({
        where: { role: 'PLAYER' },
        select: { id: true },
      });
      userIds = players.map((p: { id: string }) => p.id);
    }

    // Fetch user data with their progress
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        trainingProgress: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                category: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // Transform data for frontend
    const playerProgress = users.map((user: any) => {
      const allProgress = user.trainingProgress;
      const completedTasks = allProgress.filter((p: any) => p.status === 'COMPLETED').length;
      const totalTasks = allProgress.length;
      const overdueTasks = allProgress.filter((p: any) => {
        if (!p.task) return false;
        const now = new Date();
        return p.status !== 'COMPLETED' && p.task.createdAt < now;
      }).length;

      // Calculate overall progress
      const overallProgress =
        totalTasks > 0
          ? Math.round(
              allProgress.reduce((acc: number, p: any) => acc + p.progress, 0) / totalTasks
            )
          : 0;

      // Get recent activity (last 10 updates)
      const recentActivity = allProgress
        .filter((p: any) => p.updatedAt)
        .sort((a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 10)
        .map((p: any) => ({
          date: p.updatedAt,
          taskId: p.taskId,
          taskTitle: p.task?.title || 'Unknown Task',
          type:
            p.status === 'COMPLETED'
              ? 'completed'
              : p.status === 'IN_PROGRESS'
              ? 'progress'
              : 'started',
        }));

      // Calculate strengths and areas to improve based on task categories
      const categoryProgress = allProgress.reduce((acc: any, p: any) => {
        const category = p.task?.category || 'Other';
        if (!acc[category]) {
          acc[category] = { total: 0, avgProgress: 0, count: 0 };
        }
        acc[category].count++;
        acc[category].avgProgress += p.progress;
        return acc;
      }, {});

      // Calculate average progress per category
      Object.keys(categoryProgress).forEach(cat => {
        categoryProgress[cat].avgProgress =
          categoryProgress[cat].avgProgress / categoryProgress[cat].count;
      });

      // Get top 3 categories as strengths (highest avg progress)
      const strengths = Object.entries(categoryProgress)
        .sort((a: any, b: any) => b[1].avgProgress - a[1].avgProgress)
        .slice(0, 3)
        .map((entry: any) => entry[0]);

      // Get bottom 2 categories as areas to improve (lowest avg progress)
      const areasToImprove = Object.entries(categoryProgress)
        .sort((a: any, b: any) => a[1].avgProgress - b[1].avgProgress)
        .slice(0, 2)
        .map((entry: any) => entry[0]);

      return {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        playerNumber: user.playerNumber,
        position: user.position,
        tasks: {
          completed: completedTasks,
          total: totalTasks,
          overdue: overdueTasks,
        },
        recentActivity,
        overallProgress,
        strengths,
        areasToImprove,
      };
    });

    return NextResponse.json(playerProgress);
  } catch (error) {
    console.error('Error fetching player progress:', error);
    // Return empty array as fallback when database is unavailable
    return NextResponse.json([]);
  }
}
