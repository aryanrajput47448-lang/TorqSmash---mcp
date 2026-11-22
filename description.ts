import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
const out = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
export function registerDescriptionTools(server: McpServer) {
  server.tool('generate_description', 'Prepare a ready-to-write SEO description brief for a real TorqSmash BeamNG.drive video.', {
    topic: z.string().min(5).max(1200), actual_outcome: z.string().max(500).optional(), video_format: z.enum(['Shorts','Long-form']).default('Shorts'), include_call_to_action: z.boolean().default(true)
  }, async (args) => out({ ...args, audience: 'United States', language: 'American English', instructions: 'Write one natural description. Put the most relevant phrase in the opening sentence, describe only what happens, include a genuine viewer question and optional subscribe CTA, and add 3-5 relevant hashtags. Avoid keyword stuffing and unrelated tags.' }));
}
