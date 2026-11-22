import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { config } from '../config.js';
import { searchPublicChannels } from '../services/youtube-api.js';
const out = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
export function registerChannelAnalyticsTools(server: McpServer) {
  server.tool('analyze_channel', 'Retrieve publicly visible channel details for TorqSmash or another specified YouTube channel. Does not access private Studio analytics.', {
    channel_query: z.string().min(2).max(200).default('TorqSmash')
  }, async ({ channel_query }) => {
    if (!config.youtubeApiKey) return out({ configured: false, message: 'Set YOUTUBE_API_KEY to enable public channel lookup.' });
    const channels = await searchPublicChannels(channel_query);
    return out({ channel_query, channels, analytics_boundary: 'Public channel statistics only. Private impressions, CTR, audience retention and viewed-vs-swiped-away require a separate Google OAuth integration with YouTube Analytics API scopes.' });
  });
}
