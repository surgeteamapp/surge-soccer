import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getChannelVideos } from '@/lib/youtube';

// POST /api/videos/sync-youtube - Sync videos from YouTube channel
export async function POST() {
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

    // Get YouTube API credentials from environment
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      return NextResponse.json({ 
        error: 'YouTube API not configured. Please add YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID to environment variables.',
        configured: false 
      }, { status: 400 });
    }

    // Fetch videos from YouTube channel
    const youtubeVideos = await getChannelVideos(apiKey, channelId, 100);

    if (youtubeVideos.length === 0) {
      return NextResponse.json({ 
        error: 'No videos found. This can happen if: 1) Videos are set to Private (change to Unlisted), 2) Channel is very new (wait 15-30 min for YouTube to index), 3) Videos are still processing on YouTube.',
        synced: 0,
        created: 0,
        updated: 0,
      }, { status: 404 });
    }

    // Get existing videos by YouTube ID
    const existingVideos = await prisma.video.findMany({
      where: {
        youtubeId: { in: youtubeVideos.map(v => v.id) }
      },
      select: { id: true, youtubeId: true, title: true },
    });

    const existingYoutubeIds = new Set(existingVideos.map(v => v.youtubeId));

    let created = 0;
    let updated = 0;

    // Process each YouTube video
    for (const ytVideo of youtubeVideos) {
      if (existingYoutubeIds.has(ytVideo.id)) {
        // Update existing video
        await prisma.video.updateMany({
          where: { youtubeId: ytVideo.id },
          data: {
            title: ytVideo.title,
            description: ytVideo.description,
            thumbnail: ytVideo.thumbnail,
            duration: ytVideo.durationSeconds,
          },
        });
        updated++;
      } else {
        // Create new video
        await prisma.video.create({
          data: {
            title: ytVideo.title,
            description: ytVideo.description,
            youtubeId: ytVideo.id,
            thumbnail: ytVideo.thumbnail,
            duration: ytVideo.durationSeconds,
            uploaderId: user.id,
            category: 'game', // Default category for synced videos
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      message: `Successfully synced ${youtubeVideos.length} videos`,
      synced: youtubeVideos.length,
      created,
      updated,
    });
  } catch (error) {
    console.error('Error syncing YouTube videos:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to sync videos' 
    }, { status: 500 });
  }
}

// GET /api/videos/sync-youtube - Check sync status/configuration
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    const configured = !!(apiKey && channelId);

    // Get count of synced videos (videos with youtubeId)
    const syncedCount = await prisma.video.count({
      where: {
        youtubeId: { not: null },
      },
    });

    return NextResponse.json({
      configured,
      channelId: configured ? channelId : null,
      syncedVideoCount: syncedCount,
    });
  } catch (error) {
    console.error('Error checking sync status:', error);
    return NextResponse.json({ error: 'Failed to check sync status' }, { status: 500 });
  }
}
