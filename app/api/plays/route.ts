import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET all plays for the user's team
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const playbookId = searchParams.get("playbookId");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");

    // Get user's team membership
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      select: { teamId: true },
    });

    if (!teamMember) {
      return NextResponse.json({ plays: [] });
    }

    const plays = await prisma.play.findMany({
      where: {
        teamId: teamMember.teamId,
        ...(playbookId && { playbookId }),
        ...(category && { category: category as any }),
        ...(tag && { tags: { has: tag } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { tags: { hasSome: [search.toLowerCase()] } },
          ],
        }),
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        playFrames: {
          orderBy: { frameNumber: "asc" },
        },
        playbook: {
          select: { id: true, name: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      plays: plays.map((play: any) => ({
        id: play.id,
        name: play.name,
        description: play.description,
        category: play.category,
        tags: play.tags,
        isPublished: play.isPublished,
        createdAt: play.createdAt,
        updatedAt: play.updatedAt,
        authorId: play.createdById,
        authorName: `${play.createdBy.firstName} ${play.createdBy.lastName}`,
        playbookId: play.playbookId,
        playbookName: play.playbook?.name,
        frameCount: play.playFrames.length,
        frames: play.playFrames,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch plays:", error);
    return NextResponse.json(
      { error: "Failed to fetch plays" },
      { status: 500 }
    );
  }
}

// POST - Create a new play
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team membership
    let teamId: string | null = null;
    
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      select: { teamId: true },
    });

    if (teamMember) {
      teamId = teamMember.teamId;
    } else if (session.user.role === 'ADMIN' || session.user.role === 'COACH') {
      // Admins and coaches can create plays - use the first available team
      const team = await prisma.team.findFirst({
        select: { id: true },
      });
      if (team) {
        teamId = team.id;
      }
    }

    if (!teamId) {
      return NextResponse.json(
        { error: "No team found. Please create a team first." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, category, tags, playbookId, initialFrame } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Play name is required" },
        { status: 400 }
      );
    }

    // Create play with initial frame
    const play = await prisma.play.create({
      data: {
        name,
        description,
        category: category || "OFFENSIVE",
        tags: tags || [],
        playbookId,
        teamId: teamId,
        createdById: session.user.id,
        positionData: initialFrame?.positions || {},
        playFrames: {
          create: {
            frameNumber: 0,
            duration: 1.0,
            positions: initialFrame?.positions || [],
            lines: initialFrame?.lines || [],
            annotations: initialFrame?.annotations || [],
            ballPosition: initialFrame?.ballPosition || null,
          },
        },
      },
      include: {
        playFrames: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({ play }, { status: 201 });
  } catch (error) {
    console.error("Failed to create play:", error);
    return NextResponse.json(
      { error: "Failed to create play" },
      { status: 500 }
    );
  }
}
