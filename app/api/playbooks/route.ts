import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET all playbooks for the user's team
export async function GET(request: NextRequest) {
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
      // Admins and coaches can view all playbooks - use the first available team
      const team = await prisma.team.findFirst({
        select: { id: true },
      });
      if (team) {
        teamId = team.id;
      }
    }

    if (!teamId) {
      return NextResponse.json({ playbooks: [], availableTags: [] });
    }

    // Fetch all playbooks with their plays
    // @ts-ignore - Prisma client may need regeneration
    const playbooks = await (prisma as any).playbook.findMany({
      where: { teamId: teamId },
      include: {
        plays: {
          include: {
            createdBy: {
              select: { id: true, firstName: true, lastName: true },
            },
            playVersions: {
              orderBy: { versionNumber: "desc" },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Extract all unique tags
    const allTags = new Set<string>();
    playbooks.forEach((playbook: any) => {
      playbook.plays.forEach((play: any) => {
        play.tags.forEach((tag: string) => allTags.add(tag));
      });
    });

    return NextResponse.json({
      playbooks: playbooks.map((pb: any) => ({
        id: pb.id,
        name: pb.name,
        description: pb.description,
        teamId: pb.teamId,
        createdAt: pb.createdAt,
        updatedAt: pb.updatedAt,
        plays: pb.plays.map((play: any) => ({
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
          versions: play.playVersions.map((v: any) => ({
            id: v.id,
            versionNumber: v.versionNumber,
            positionData: v.positionData,
            notes: v.notes,
            createdAt: v.createdAt,
          })),
          currentVersionId: play.playVersions[0]?.id || null,
        })),
      })),
      availableTags: Array.from(allTags),
    });
  } catch (error) {
    console.error("Failed to fetch playbooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch playbooks" },
      { status: 500 }
    );
  }
}

// POST - Create a new playbook
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team membership
    let teamId: string | null = null;
    
    console.log("Creating playbook - User ID:", session.user.id, "Role:", session.user.role);
    
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      select: { teamId: true },
    });

    console.log("Team member found:", teamMember);

    if (teamMember) {
      teamId = teamMember.teamId;
    } else if (session.user.role === 'ADMIN' || session.user.role === 'COACH') {
      // Admins and coaches can create playbooks - use the first available team
      const team = await prisma.team.findFirst({
        select: { id: true },
      });
      console.log("Admin/Coach fallback - Team found:", team);
      if (team) {
        teamId = team.id;
      }
    }

    console.log("Final teamId:", teamId);

    if (!teamId) {
      return NextResponse.json(
        { error: "No team found. Please create a team first." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Playbook name is required" },
        { status: 400 }
      );
    }

    // @ts-ignore - Prisma client may need regeneration
    const playbook = await (prisma as any).playbook.create({
      data: {
        name,
        description,
        teamId: teamId,
      },
    });

    return NextResponse.json({ playbook }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create playbook:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create playbook" },
      { status: 500 }
    );
  }
}
