import { config } from '../config.js';

export interface PublicVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

async function youtubeGet<T>(resource: string, params: Record<string, string>): Promise<T> {
  if (!config.youtubeApiKey) throw new Error('YOUTUBE_API_KEY is not configured.');
  const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
  for (const [key, value] of Object.entries({ ...params, key: config.youtubeApiKey })) url.searchParams.set(key, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`YouTube API returned HTTP ${response.status}. Check API key, quota and permissions.`);
  return await response.json() as T;
}

export async function searchPublicVideos(query: string, maxResults = 10): Promise<PublicVideo[]> {
  const data = await youtubeGet<{ items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string; publishedAt?: string } }> }>('search', {
    part: 'snippet', type: 'video', q: query, maxResults: String(maxResults), order: 'viewCount', regionCode: 'US', relevanceLanguage: 'en'
  });
  const base = (data.items ?? []).flatMap((item) => {
    const id = item.id?.videoId;
    if (!id) return [];
    return [{ videoId: id, title: item.snippet?.title ?? '', channelTitle: item.snippet?.channelTitle ?? '', publishedAt: item.snippet?.publishedAt ?? '', url: `https://www.youtube.com/watch?v=${id}` }];
  });
  if (!base.length) return [];
  const stats = await youtubeGet<{ items?: Array<{ id: string; statistics?: { viewCount?: string; likeCount?: string; commentCount?: string } }> }>('videos', {
    part: 'statistics', id: base.map((v) => v.videoId).join(',')
  });
  const map = new Map((stats.items ?? []).map((v) => [v.id, v.statistics ?? {}]));
  return base.map((v) => ({ ...v, ...map.get(v.videoId) }));
}

export async function searchPublicChannels(query: string) {
  const found = await youtubeGet<{ items?: Array<{ id?: { channelId?: string } }> }>('search', {
    part: 'snippet', type: 'channel', q: query, maxResults: '5', regionCode: 'US', relevanceLanguage: 'en'
  });
  const ids = (found.items ?? []).flatMap((v) => v.id?.channelId ? [v.id.channelId] : []);
  if (!ids.length) return [];
  const details = await youtubeGet<{ items?: Array<{ id: string; snippet?: { title?: string; description?: string }; statistics?: { subscriberCount?: string; videoCount?: string; viewCount?: string } }> }>('channels', { part: 'snippet,statistics', id: ids.join(',') });
  return (details.items ?? []).map((c) => ({
    channelId: c.id, title: c.snippet?.title ?? '', description: c.snippet?.description ?? '',
    subscriberCount: c.statistics?.subscriberCount ?? null, videoCount: c.statistics?.videoCount ?? null, viewCount: c.statistics?.viewCount ?? null
  }));
}
