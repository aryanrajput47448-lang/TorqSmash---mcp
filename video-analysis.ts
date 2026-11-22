import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { reviewVideoBrief } from '../services/video-service.js';
const out = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
export function registerVideoAnalysisTools(server: McpServer) {
  server.tool('analyze_video', 'Review a text description and timestamp notes for a BeamNG.drive Short. This tool does not inspect uploaded video pixels or audio.', {
    video_description: z.string().min(10).max(5000), duration_seconds: z.number().int().positive().max(3600).optional(), timestamp_notes: z.string().max(5000).optional(), actual_outcome: z.string().max(500).optional()
  }, async (args) => out(reviewVideoBrief({ description: args.video_description, durationSeconds: args.duration_seconds, timestampNotes: args.timestamp_notes, outcome: args.actual_outcome })));
}
