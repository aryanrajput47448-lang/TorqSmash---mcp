# GitHub Upload Guide (Hindi)

1. ZIP extract karein. `torqsmash-growth-mcp` folder ke andar ki sab files/folders repository ke ROOT mein upload karein. Pehle local project folder mein `npm install` chalayein taaki `package-lock.json` generate ho; phir use bhi commit karein.
2. `.env` kabhi upload na karein. Sirf `.env.example` upload karein.
3. GitHub root mein `src/`, `tests/`, `.github/`, `package.json`, `package-lock.json`, `Dockerfile`, `render.yaml`, `tsconfig.json`, `README.md`, `LICENSE` dikhna chahiye.
4. GitHub Actions tab mein CI workflow ka result dekhein. Green check aane ke baad hi deploy karein.
5. Render mein New > Blueprint select karke repository connect karein. `MCP_API_KEY` Render generate karega. `YOUTUBE_API_KEY` optional hai.
6. Deploy ke baad `https://YOUR-SERVICE.onrender.com/health` kholkar `ok: true` check karein.
7. MCP URL `https://YOUR-SERVICE.onrender.com/mcp` hai. Claude ke custom remote MCP connector mein ye URL add karein.
8. Is server ko `Authorization: Bearer <MCP_API_KEY>` header chahiye. Claude UI mein custom request header support available hona zaroori hai. Agar aapke account/UI mein ye option nahi hai, authentication ko disable na karein; OAuth-based connector authentication implement karein.

## Important

YouTube Data API key public video/channel research ke liye optional hai. Is API se monthly keyword search volume, keyword difficulty ya private YouTube Studio metrics nahi milte. Private analytics ke liye separate Google OAuth + YouTube Analytics API implementation chahiye.
