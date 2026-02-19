import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!DAILY_API_KEY) {
      return NextResponse.json({ error: 'Daily.co API key not configured' }, { status: 500 });
    }

    const { videoId, roomName } = await req.json();

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    // Create a unique room name based on videoId
    const uniqueRoomName = roomName || `film-study-${videoId.slice(0, 8)}`;

    // Check if room already exists
    const checkResponse = await fetch(`${DAILY_API_URL}/rooms/${uniqueRoomName}`, {
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (checkResponse.ok) {
      const existingRoom = await checkResponse.json();
      return NextResponse.json({
        url: existingRoom.url,
        name: existingRoom.name,
        created: false,
      });
    }

    // Create new room
    const createResponse = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: uniqueRoomName,
        properties: {
          max_participants: 20,
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 86400, // Expires in 24 hours
        },
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error('Daily.co room creation error:', error);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    const room = await createResponse.json();

    return NextResponse.json({
      url: room.url,
      name: room.name,
      created: true,
    });
  } catch (error) {
    console.error('Daily room API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'COACH' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only coaches can delete rooms' }, { status: 403 });
    }

    if (!DAILY_API_KEY) {
      return NextResponse.json({ error: 'Daily.co API key not configured' }, { status: 500 });
    }

    const { roomName } = await req.json();

    if (!roomName) {
      return NextResponse.json({ error: 'Room name required' }, { status: 400 });
    }

    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Daily room delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
