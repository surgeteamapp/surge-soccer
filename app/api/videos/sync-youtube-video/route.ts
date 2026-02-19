import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getVideoById } from '@/lib/youtube';

// POST /api/videos/sync-youtube-video - Sync a single video by URL or ID
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is COACH or ADMIN
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== 'COACH' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Only coaches and admins can sync videos' }, { status: 403 });
    }

    const body = await request.json();
    const { videoUrl, category = 'game' } = body;

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.' }, { status: 400 });
    }

    // Get YouTube API key
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API not configured' }, { status: 400 });
    }

    // Check if video already exists
    const existing = await prisma.video.findFirst({
      where: { youtubeId: videoId },
    });

    if (existing) {
      return NextResponse.json({ 
        message: 'Video already synced',
        video: existing,
        created: false,
      });
    }

    // Fetch video from YouTube
    const ytVideo = await getVideoById(apiKey, videoId);
    if (!ytVideo) {
      return NextResponse.json({ error: 'Video not found on YouTube. Make sure the video is Public or Unlisted.' }, { status: 404 });
    }

    // Create the video in database
    const video = await prisma.video.create({
      data: {
        title: ytVideo.title,
        description: ytVideo.description,
        youtubeId: ytVideo.id,
        thumbnail: ytVideo.thumbnail,
        duration: ytVideo.durationSeconds,
        uploaderId: user.id,
        category: category,
      },
    });

    return NextResponse.json({
      message: 'Video synced successfully',
      video,
      created: true,
    });
  } catch (error) {
    console.error('Error syncing YouTube video:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to sync video' 
    }, { status: 500 });
  }
}

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
