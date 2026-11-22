# TorqSmash Growth MCP

A starter Remote MCP server for a USA-focused BeamNG.drive gameplay channel. It exposes 8 tools over stateless Streamable HTTP at `/mcp`.

## What it does

- `generate_seo_package`: SEO brief and writing rules for a video.
- `generate_titles`: title-generation instructions and scoring criteria.
- `research_keywords`: live US YouTube result samples for search phrases.
- `analyze_competitors`: public competitor video samples and analysis guidance.
- `analyze_video_brief`: retention/editing review from text notes supplied by the user.
- `generate_shorts_hooks`: opening hooks and captions.
- `generate_thumbnail_text`: short cover-text ideas.
- `analyze_channel_public`: public channel lookup guidance.

Claude is the language model that turns the returned structured briefs into final copy. This server does not itself generate AI text or inspect uploaded video pixels. YouTube Data API does not expose monthly keyword volume. Private Studio analytics need a separate Google OAuth integration and YouTube Analytics API implementation.

## Requirements

- Node.js 20+
- Public HTTPS hosting on port 443 for Claude Remote MCP
- `MCP_API_KEY` (long random secret)
- Optional `YOUTUBE_API_KEY` with YouTube Data API v3 enabled in Google Cloud

## Run locally

```bash
cp .env.example .env
# Edit .env and set MCP_API_KEY
npm install
npm run dev
```

Health check: `http://localhost:3000/health`
MCP endpoint: `http://localhost:3000/mcp` (local testing only; Claude requires public HTTPS)

## Deploy to Render (simple option)

1. Put this folder in a private GitHub repository.
2. In Render, create **New + → Web Service**, connect the repository.
3. Runtime: Docker (Render detects the Dockerfile).
4. Add environment variables: `MCP_API_KEY`, optional `YOUTUBE_API_KEY`, and `CHANNEL_NAME=TorqSmash`.
5. Deploy. Copy the HTTPS service URL, e.g. `https://your-service.onrender.com/mcp`.
6. Test `https://your-service.onrender.com/health` in a browser. It should return `{"ok":true,...}`.
7. Do not share the API key or commit `.env` to GitHub.

For production, use a paid always-on instance if your host sleeps free services; sleeping services may cause Claude connection timeouts.

## Add to Claude

In Claude, open **Settings → Connectors → Add custom connector** (labels may vary), choose a web/remote connector, name it `TorqSmash AI Growth`, and enter the full HTTPS URL ending in `/mcp`.

When Claude asks for authentication, choose the fixed request-header/API-key option if available and configure:

- Header name: `Authorization`
- Header value: `Bearer YOUR_MCP_API_KEY`

If the UI does not offer custom request headers for your account, use a supported OAuth configuration or add an OAuth layer to this server; do not remove authentication just to make it connect. Claude's current setup screens and supported authentication options can change.

## Example prompts in Claude

- "Use generate_seo_package for this BeamNG.drive Short: [describe the actual video]."
- "Use research_keywords for BeamNG.drive canyon jump gameplay, US region. Do not invent search volumes."
- "Use analyze_competitors for BeamNG.drive crash challenge and summarize repeatable title patterns."
- "Use analyze_video_brief. Here are my timestamp notes: 0:00 ..."

## Security notes

- Treat this connector as private. Anyone with the URL and bearer key can call its tools.
- Keep keys in host environment variables, never in source code or screenshots.
- Rotate the key if it is exposed.
- This starter is API-key protected, not OAuth. Confirm Claude's current custom-header support in your account before deployment.
- Do not add write/publish/delete YouTube capabilities without explicit review and confirmation.
