# TorqSmash Growth MCP

Remote Model Context Protocol server for USA-focused BeamNG.drive content planning and public YouTube research for the TorqSmash channel.

## Tools

- `generate_titles` — title-writing brief and scoring criteria.
- `generate_description` — description-writing brief.
- `research_keywords` — public US-region YouTube video examples for keyword exploration.
- `analyze_competitors` — public video examples and comparison guidance.
- `analyze_video` — review text descriptions and timestamp notes.
- `generate_hooks` — opening hooks and on-screen captions.
- `generate_thumbnail_text` — short thumbnail text ideas.
- `analyze_channel` — public channel details.

## Honest capability boundaries

- Claude composes final titles, descriptions, hooks and strategic analysis from the tool results. These tools do not claim an AI model is embedded in the MCP server.
- YouTube Data API public search and channel lookup require `YOUTUBE_API_KEY`.
- YouTube Data API does not provide monthly keyword search volume or keyword difficulty.
- `analyze_video` reviews text supplied by the user; it does not decode video uploads, inspect frames or process audio.
- Public channel statistics are not private YouTube Studio analytics. Private impressions, CTR and retention require a separate Google OAuth flow and YouTube Analytics API implementation; that is not included in this release.
- No tool uploads, publishes, edits or deletes YouTube content.

## Requirements

- Node.js 20.11+ (Node 22 recommended)
- npm 10+
- `MCP_API_KEY` with at least 32 characters
- Optional YouTube Data API v3 key

## Local setup

```bash
cp .env.example .env
# Edit .env and set MCP_API_KEY (32+ characters)
npm install
npm run check
npm run build
npm test
npm start
```

Health endpoint: `http://localhost:3000/health`
Remote MCP endpoint: `http://localhost:3000/mcp`

For development: `npm run dev`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MCP_API_KEY` | Yes | Bearer secret, minimum 32 characters |
| `YOUTUBE_API_KEY` | No | Public YouTube Data API v3 lookup |
| `CHANNEL_NAME` | No | Defaults to TorqSmash |
| `PORT` | No | Defaults to 3000 |
| `NODE_ENV` | No | Defaults to production |

## GitHub

Run `npm install` once in the project folder to generate `package-lock.json`, then commit that generated lockfile. Upload the CONTENTS of this folder to the repository root, not the outer folder as a nested directory. Include `.github/workflows/ci.yml`. Never commit `.env`, API keys, `node_modules` or `dist`.

## Render deployment

1. Push this project to GitHub.
2. In Render choose **New → Blueprint** and select the repository.
3. Render reads `render.yaml` and builds the Docker image.
4. Set `YOUTUBE_API_KEY` in Render if public YouTube research is required.
5. Wait for deployment and verify `/health` returns `{"ok":true,...}`.
6. Set the Claude remote MCP connector URL to `https://YOUR-SERVICE.onrender.com/mcp`.
7. Configure the fixed request header `Authorization: Bearer YOUR_MCP_API_KEY` if the Claude connector UI supports custom headers. Do not remove server authentication if it does not.

The included Render blueprint uses a paid Starter plan for always-on availability. Adjust the plan if you understand the limitations of a free/sleeping service.

## MCP transport and authentication

This project uses the official MCP TypeScript SDK with Streamable HTTP transport in stateless mode. MCP requests are accepted via POST `/mcp`. Bearer authentication is required. Health check `/health` is intentionally public for hosting health probes.

## Tests and CI

GitHub Actions runs `npm install`, TypeScript checking, production build and Node tests on pushes and pull requests. Run the same commands locally before deployment.

## Security

- Keep `.env` and all tokens private.
- Rotate the secret immediately if exposed.
- Do not paste secrets into GitHub issues, screenshots or chat.
- Keep the YouTube API key restricted in Google Cloud where possible.
