import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { config } from '../config.js';
import { searchPublicVideos } from '../services/youtube-api.js';
const out = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
export function registerCompetitorTools(server: McpServer) {
  server.tool('analyze_competitors', 'Find public BeamNG.drive YouTube videos in US-region search and provide evidence for competitor pattern analysis.', {
    search_phrase: z.string().min(2).max(200).default('BeamNG.drive car crash challenge'), max_results: z.number().int().min(5).max(20).default(10)
  }, async ({ search_phrase, max_results }) => {
    if (!config.youtubeApiKey) return out({ configured: false, message: 'Set YOUTUBE_API_KEY to enable public competitor research.' });
    const videos = await searchPublicVideos(search_phrase, max_results);
    return out({ search_phrase, region: 'US', videos, analysis_guidance: ['Compare title structures, topics and public view counts.', 'Treat views as a point-in-time public metric, not proof of why a video performed.', 'Identify original ideas TorqSmash can adapt; do not copy videos.', 'Private competitor analytics are not available.'] });
  });
}
