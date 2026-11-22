import express, { Request, Response, NextFunction } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const PORT = Number(process.env.PORT || 3000);
const MCP_API_KEY = process.env.MCP_API_KEY || '';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const CHANNEL_NAME = process.env.CHANNEL_NAME || 'TorqSmash';
const CHANNEL_NICHE = 'BeamNG.drive gameplay, simulated vehicle collisions, car-vs-obstacle challenges, vehicle physics and driving-game Shorts';

if (!MCP_API_KEY || MCP_API_KEY.length < 24) {
  throw new Error('Set MCP_API_KEY to a random secret of at least 24 characters.');
}

const app = express();
app.use(express.json({ limit: '1mb' }));

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!safeEqual(token, MCP_API_KEY)) {
    res.status(401).json({ error: 'Unauthorized. Provide the configured Bearer token.' });
    return;
  }
  next();
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'TorqSmash Growth MCP', version: '1.0.0' }));

async function ytSearch(query: string, maxResults = 10) {
  if (!YOUTUBE_API_KEY) return { configured: false, note: 'YOUTUBE_API_KEY is not configured. Live YouTube research is unavailable.', items: [] as any[] };
  const params = new URLSearchParams({ part: 'snippet', type: 'video', q: query, maxResults: String(Math.min(maxResults, 25)), order: 'viewCount', regionCode: 'US', relevanceLanguage: 'en', key: YOUTUBE_API_KEY });
  const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!r.ok) throw new Error(`YouTube API error ${r.status}: ${(await r.text()).slice(0, 400)}`);
  const data: any = await r.json();
  const ids = (data.items || []).map((x: any) => x.id?.videoId).filter(Boolean);
  let stats: Record<string, any> = {};
  if (ids.length) {
    const p = new URLSearchParams({ part: 'statistics,contentDetails', id: ids.join(','), key: YOUTUBE_API_KEY });
    const sr = await fetch(`https://www.googleapis.com/youtube/v3/videos?${p}`);
    if (sr.ok) {
      const sd: any = await sr.json();
      stats = Object.fromEntries((sd.items || []).map((v: any) => [v.id, v]));
    }
  }
  return { configured: true, items: (data.items || []).map((x: any) => ({
    title: x.snippet?.title, channelTitle: x.snippet?.channelTitle,
    publishedAt: x.snippet?.publishedAt, videoId: x.id?.videoId,
    url: x.id?.videoId ? `https://www.youtube.com/watch?v=${x.id.videoId}` : undefined,
    viewCount: stats[x.id?.videoId]?.statistics?.viewCount,
    likeCount: stats[x.id?.videoId]?.statistics?.likeCount,
    commentCount: stats[x.id?.videoId]?.statistics?.commentCount
  })) };
}

function result(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function createServer() {
  const server = new McpServer({ name: 'torqsmash-growth-mcp', version: '1.0.0' });

  server.tool('generate_seo_package', 'Create a complete USA-focused YouTube SEO brief for a TorqSmash BeamNG.drive video. Returns structured guidance for Claude to turn into polished copy. Never invent keyword volumes.', {
    video_topic: z.string().min(3).describe('What happens in the uploaded video; be specific.'),
    cars_or_objects: z.string().optional(),
    video_length_seconds: z.number().int().positive().optional(),
    outcome: z.string().optional().describe('What actually happens at the end; do not invent an outcome.'),
    audience: z.string().default('United States'),
    format: z.enum(['Shorts', 'Long-form']).default('Shorts')
  }, async (args) => result({ channel: CHANNEL_NAME, niche: CHANNEL_NICHE, ...args,
    keywordIdeas: ['BeamNG.drive', 'BeamNG.drive crash', 'BeamNG.drive challenge', 'BeamNG.drive car crash', 'BeamNG.drive gameplay'],
    deliverables: ['10 concise American-English titles; rank the best 3 and explain why', 'One natural description with the main phrase near the beginning', '3-5 relevant hashtags', '15 relevant tags, comma-separated', '5 primary and 10 secondary keyword ideas', '5 long-tail search phrase ideas', 'one pinned comment that invites a genuine response'],
    rules: ['Match every claim to the actual footage.', 'Use curiosity, not misleading clickbait.', 'Do not claim guaranteed virality or rankings.', 'Do not invent search volume or keyword difficulty.', 'Do not add unrelated GTA, tattoo, drawing or generic gaming terms.', 'Use BeamNG.drive spelling consistently.']
  }));

  server.tool('generate_titles', 'Generate and score YouTube titles for a specific TorqSmash video.', {
    topic: z.string().min(3), outcome: z.string().optional(), style: z.enum(['curiosity','challenge','comparison','clean-search']).default('curiosity'), count: z.number().int().min(3).max(15).default(10)
  }, async ({ topic, outcome, style, count }) => result({ topic, outcome, style, count, instruction: `Write ${count} distinct short titles in natural American English. Include BeamNG.drive or a relevant crash/challenge phrase where natural. Score each 1-10 for clarity, curiosity and accuracy. Pick one winner. Do not imply a result that the footage does not show.` }));

  server.tool('research_keywords', 'Research real YouTube search results for BeamNG.drive phrases in the US. Results are examples from YouTube, not search-volume estimates.', {
    seed_keyword: z.string().min(2).default('BeamNG.drive car crash'), extra_terms: z.array(z.string()).optional(), max_results: z.number().int().min(3).max(20).default(10)
  }, async ({ seed_keyword, extra_terms, max_results }) => {
    const terms = [seed_keyword, ...(extra_terms || [])].slice(0, 5);
    const searches = await Promise.all(terms.map(async q => ({ query: q, ...(await ytSearch(q, max_results)) })));
    return result({ region: 'US', searches, caveat: 'YouTube Data API search results do not provide monthly keyword search volume or keyword difficulty. Do not label result counts as search volume.' });
  });

  server.tool('analyze_competitors', 'Find public high-view BeamNG.drive videos in US-oriented YouTube search and summarize patterns without copying creators.', {
    search_phrase: z.string().default('BeamNG.drive crash challenge'), max_results: z.number().int().min(5).max(20).default(10)
  }, async ({ search_phrase, max_results }) => {
    const data = await ytSearch(search_phrase, max_results);
    return result({ search_phrase, region: 'US', research: data, analysis_instructions: ['Group title patterns and video concepts.', 'Identify repeatable editing and hook patterns only when visible from supplied data.', 'Treat view counts as current snapshots, not proof of why a video succeeded.', 'Do not copy titles or claim competitor analytics that are not public.'] });
  });

  server.tool('analyze_video_brief', 'Analyze a supplied video description or timestamp notes for hook, pacing and audience-retention opportunities. This tool does not watch a video file by itself.', {
    video_description: z.string().min(10), duration_seconds: z.number().int().positive().optional(), timestamp_notes: z.string().optional(), intended_result: z.string().optional()
  }, async (args) => result({ ...args, limitation: 'This tool receives text notes only. It cannot inspect uploaded video frames or hear audio unless the user supplies accessible descriptions/transcript or a separate video-analysis service is configured.', analysis_checklist: ['Does frame one clearly show the challenge?', 'Is the question understandable immediately?', 'Is there unnecessary setup?', 'Does each shot add new information?', 'Is the result easy to understand?', 'Does the ending invite a replay without being confusing?'], request_claude: 'Give timestamp-specific improvements only where timestamps were provided. Do not recommend dangerous real-world stunts; this is simulated gameplay.' }));

  server.tool('generate_shorts_hooks', 'Create opening hooks and on-screen captions for a BeamNG.drive gameplay Short.', {
    video_topic: z.string().min(3), actual_outcome: z.string().optional(), count: z.number().int().min(3).max(10).default(5)
  }, async ({ video_topic, actual_outcome, count }) => result({ video_topic, actual_outcome, hooks: count, instruction: 'Write short readable US-English on-screen hooks for the first 1-2 seconds, then mid-video text, final reveal text and one comment question. Hooks must accurately describe the footage.' }));

  server.tool('generate_thumbnail_text', 'Generate short mobile-readable thumbnail or cover text for a TorqSmash video.', {
    topic: z.string().min(3), focus: z.enum(['car-vs-obstacle','crash-test','which-car-wins','survival-question']).default('which-car-wins')
  }, async ({ topic, focus }) => result({ topic, focus, instruction: 'Create 8 options of 2-5 words in American English. Avoid claims not supported by the video. Prioritize clear wording and a strong visual question.' }));

  server.tool('analyze_channel_public', 'Retrieve publicly available channel information and recent public videos using YouTube Data API. Private Studio analytics require separate Google OAuth and are not included.', {
    channel_query: z.string().default('TorqSmash'), max_results: z.number().int().min(3).max(15).default(10)
  }, async ({ channel_query, max_results }) => {
    if (!YOUTUBE_API_KEY) return result({ configured: false, message: 'Set YOUTUBE_API_KEY to enable public channel lookup.' });
    const p = new URLSearchParams({ part: 'snippet', type: 'channel', q: channel_query, maxResults: '5', key: YOUTUBE_API_KEY });
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${p}`);
    if (!r.ok) throw new Error(`YouTube API error ${r.status}`);
    const d: any = await r.json();
    const ids = (d.items || []).map((x: any) => x.id?.channelId).filter(Boolean);
    let channels: any[] = [];
    if (ids.length) {
      const cp = new URLSearchParams({ part: 'snippet,statistics', id: ids.join(','), key: YOUTUBE_API_KEY });
      const cr = await fetch(`https://www.googleapis.com/youtube/v3/channels?${cp}`);
      if (cr.ok) { const cd: any = await cr.json(); channels = (cd.items || []).map((x: any) => ({ channelId: x.id, title: x.snippet?.title, description: x.snippet?.description, subscriberCount: x.statistics?.subscriberCount, videoCount: x.statistics?.videoCount, viewCount: x.statistics?.viewCount })); }
    }
    return result({ channel_query, channelCandidates: channels, note: `Public channel lookup only. To inspect private Studio impressions, viewed-vs-swiped-away and retention, a separate user-authorized YouTube Analytics OAuth integration is required. Suggested channel: ${CHANNEL_NAME}.` });
  });

  return server;
}

app.post('/mcp', auth, async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => { void transport.close(); void server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('MCP request failed:', err);
    if (!res.headersSent) res.status(500).json({ error: 'MCP request failed' });
  }
});

app.get('/mcp', auth, (_req, res) => res.status(405).send('Use POST for this stateless MCP endpoint.'));
app.delete('/mcp', auth, (_req, res) => res.status(405).send('Stateless endpoint: no session to delete.'));
app.listen(PORT, '0.0.0.0', () => console.log(`TorqSmash MCP listening on ${PORT}`));
