import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { config } from '../config.js';
import { researchKeywordExamples } from '../services/keyword-research.js';
const out = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
export function registerKeywordTools(server: McpServer) {
  server.tool('research_keywords', 'Research US-region public YouTube video examples for BeamNG.drive keywords. Does not claim search volume or keyword difficulty.', {
    seed_keyword: z.string().min(2).max(200).default('BeamNG.drive car crash'), extra_terms: z.array(z.string().min(2).max(200)).max(4).default([]), max_results: z.number().int().min(3).max(20).default(8)
  }, async ({ seed_keyword, extra_terms, max_results }) => {
    if (!config.youtubeApiKey) return out({ configured: false, message: 'Set YOUTUBE_API_KEY to enable live public YouTube research.', seed_keyword, suggested_related_terms: ['BeamNG.drive crash','BeamNG.drive car challenge','BeamNG.drive obstacle course','BeamNG.drive realistic crash'] });
    return out(await researchKeywordExamples(seed_keyword, extra_terms, max_results));
  });
}
