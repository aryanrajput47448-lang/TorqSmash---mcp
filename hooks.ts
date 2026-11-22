import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
const out = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
export function registerHookTools(server: McpServer) {
  server.tool('generate_hooks', 'Create short accurate opening hooks and on-screen captions for a TorqSmash Shorts video.', {
    topic: z.string().min(5).max(1200), actual_outcome: z.string().max(500).optional(), count: z.number().int().min(3).max(10).default(5)
  }, async ({ topic, actual_outcome, count }) => out({ topic, actual_outcome, count, instructions: `Write ${count} first-1-to-2-second hooks, one mid-video caption, one final reveal caption and one comment question. Keep text brief and mobile-readable. Match the actual footage; do not invent the result.` }));
}
