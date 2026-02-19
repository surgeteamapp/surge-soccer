/**
 * YouTube Data API service for fetching videos from a channel
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string; // ISO 8601 duration format (e.g., "PT10M30S")
  durationSeconds: number;
}

interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string;
  };
}

/**
 * Parse ISO 8601 duration to seconds
 * e.g., "PT1H30M45S" -> 5445 seconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get the uploads playlist ID for a channel
 * For YouTube channels, uploads playlist ID = channel ID with "UC" replaced by "UU"
 */
function getUploadsPlaylistId(channelId: string): string {
  // YouTube uploads playlist ID is the channel ID with "UC" prefix replaced by "UU"
  if (channelId.startsWith('UC')) {
    return 'UU' + channelId.slice(2);
  }
  // If it doesn't start with UC, assume it's already a playlist ID or try as-is
  return channelId;
}

/**
 * Fetch all videos from a YouTube channel
 * Tries playlist API first (for unlisted videos), then falls back to search API (public only)
 */
export async function getChannelVideos(
  apiKey: string,
  channelId: string,
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  let videos: YouTubeVideo[] = [];
  
  // Try playlist API first (works for unlisted videos)
  const uploadsPlaylistId = getUploadsPlaylistId(channelId);
  console.log('Trying uploads playlist:', uploadsPlaylistId);

  try {
    videos = await fetchFromPlaylist(apiKey, uploadsPlaylistId, maxResults);
    if (videos.length > 0) {
      console.log(`Found ${videos.length} videos via playlist API`);
      return videos;
    }
  } catch (err) {
    console.log('Playlist API failed, trying search API...', err);
  }

  // Fallback to search API (only finds public videos)
  console.log('Trying search API for channel:', channelId);
  try {
    videos = await fetchFromSearch(apiKey, channelId, maxResults);
    console.log(`Found ${videos.length} videos via search API`);
  } catch (err) {
    console.log('Search API also failed:', err);
  }

  return videos;
}

async function fetchFromPlaylist(
  apiKey: string,
  playlistId: string,
  maxResults: number
): Promise<YouTubeVideo[]> {
  const videos: YouTubeVideo[] = [];
  let pageToken: string | undefined;

  do {
    const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    playlistUrl.searchParams.set('key', apiKey);
    playlistUrl.searchParams.set('playlistId', playlistId);
    playlistUrl.searchParams.set('part', 'snippet,contentDetails');
    playlistUrl.searchParams.set('maxResults', Math.min(maxResults, 50).toString());
    if (pageToken) {
      playlistUrl.searchParams.set('pageToken', pageToken);
    }

    const playlistResponse = await fetch(playlistUrl.toString());
    if (!playlistResponse.ok) {
      const error = await playlistResponse.json();
      throw new Error(error.error?.message || 'Playlist fetch failed');
    }

    const playlistData = await playlistResponse.json();
    const items = playlistData.items || [];
    pageToken = playlistData.nextPageToken;

    if (items.length === 0) break;

    // Get video details (duration)
    const videoIds = items.map((item: any) => item.contentDetails.videoId).join(',');
    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailsUrl.searchParams.set('key', apiKey);
    detailsUrl.searchParams.set('id', videoIds);
    detailsUrl.searchParams.set('part', 'contentDetails');

    const detailsResponse = await fetch(detailsUrl.toString());
    const detailsData = detailsResponse.ok ? await detailsResponse.json() : { items: [] };
    const detailsMap = new Map<string, YouTubeVideoDetails>();
    (detailsData.items || []).forEach((item: YouTubeVideoDetails) => {
      detailsMap.set(item.id, item);
    });

    for (const item of items) {
      const videoId = item.contentDetails.videoId;
      const details = detailsMap.get(videoId);
      const duration = details?.contentDetails?.duration || 'PT0S';

      videos.push({
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || 
                   item.snippet.thumbnails?.medium?.url || 
                   item.snippet.thumbnails?.default?.url || '',
        publishedAt: item.snippet.publishedAt,
        duration,
        durationSeconds: parseDuration(duration),
      });
    }

    if (videos.length >= maxResults || !pageToken) break;
  } while (pageToken);

  return videos.slice(0, maxResults);
}

async function fetchFromSearch(
  apiKey: string,
  channelId: string,
  maxResults: number
): Promise<YouTubeVideo[]> {
  const videos: YouTubeVideo[] = [];
  let pageToken: string | undefined;

  do {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('channelId', channelId);
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('order', 'date');
    searchUrl.searchParams.set('maxResults', Math.min(maxResults, 50).toString());
    if (pageToken) {
      searchUrl.searchParams.set('pageToken', pageToken);
    }

    const searchResponse = await fetch(searchUrl.toString());
    if (!searchResponse.ok) {
      const error = await searchResponse.json();
      throw new Error(error.error?.message || 'Search failed');
    }

    const searchData = await searchResponse.json();
    const items: YouTubeSearchItem[] = searchData.items || [];
    pageToken = searchData.nextPageToken;

    if (items.length === 0) break;

    // Get video details (duration)
    const videoIds = items.map(item => item.id.videoId).join(',');
    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailsUrl.searchParams.set('key', apiKey);
    detailsUrl.searchParams.set('id', videoIds);
    detailsUrl.searchParams.set('part', 'contentDetails');

    const detailsResponse = await fetch(detailsUrl.toString());
    const detailsData = detailsResponse.ok ? await detailsResponse.json() : { items: [] };
    const detailsMap = new Map<string, YouTubeVideoDetails>();
    (detailsData.items || []).forEach((item: YouTubeVideoDetails) => {
      detailsMap.set(item.id, item);
    });

    for (const item of items) {
      const videoId = item.id.videoId;
      const details = detailsMap.get(videoId);
      const duration = details?.contentDetails?.duration || 'PT0S';

      videos.push({
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || 
                   item.snippet.thumbnails.medium?.url || 
                   item.snippet.thumbnails.default?.url || '',
        publishedAt: item.snippet.publishedAt,
        duration,
        durationSeconds: parseDuration(duration),
      });
    }

    if (videos.length >= maxResults || !pageToken) break;
  } while (pageToken);

  return videos.slice(0, maxResults);
}

/**
 * Get a single video's details by ID
 */
export async function getVideoById(
  apiKey: string,
  videoId: string
): Promise<YouTubeVideo | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('id', videoId);
  url.searchParams.set('part', 'snippet,contentDetails');

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`YouTube API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const item = data.items?.[0];

  if (!item) return null;

  const duration = item.contentDetails?.duration || 'PT0S';

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high?.url || 
               item.snippet.thumbnails.medium?.url || 
               item.snippet.thumbnails.default?.url || '',
    publishedAt: item.snippet.publishedAt,
    duration,
    durationSeconds: parseDuration(duration),
  };
}
