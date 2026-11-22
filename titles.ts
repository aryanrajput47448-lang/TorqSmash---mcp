import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
const out = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
export function registerTitleTools(server: McpServer) {
  server.tool('generate_titles', 'Create accurate USA-English YouTube title options for a TorqSmash BeamNG.drive video. Claude writes and scores the final options.', {
    topic: z.string().min(5).max(1200), actual_outcome: z.string().max(500).optional(), style: z.enum(['curiosity','challenge','comparison','search-focused']).default('curiosity'), count: z.number().int().min(3).max(15).default(10)
  }, async ({ topic, actual_outcome, style, count }) => out({ topic, actual_outcome, style, count, channel: 'TorqSmash', audience: 'United States', instructions: `Write ${count} distinct concise American-English titles. Score clarity, curiosity and factual accuracy, then select the best three. Use BeamNG.drive or a relevant crash/challenge phrase naturally. Never invent an outcome.` }));
}
