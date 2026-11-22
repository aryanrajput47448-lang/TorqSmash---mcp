import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
const out = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
export function registerThumbnailTools(server: McpServer) {
  server.tool('generate_thumbnail_text', 'Create short mobile-readable thumbnail or cover text options for a TorqSmash BeamNG.drive video.', {
    topic: z.string().min(5).max(1200), focus: z.enum(['car-vs-obstacle','simulated-crash','which-car-wins','survival-question']).default('which-car-wins')
  }, async ({ topic, focus }) => out({ topic, focus, instructions: 'Create eight American-English options of 2-5 words each. Be clear, curious and accurate. Do not claim a winner or crash outcome unless confirmed by the footage.' }));
}
