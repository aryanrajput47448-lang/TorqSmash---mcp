import { searchPublicVideos } from './youtube-api.js';

export async function researchKeywordExamples(seed: string, extra: string[] = [], maxResults = 8) {
  const queries = [seed, ...extra];
  const results = await Promise.all(queries.map(async (query) => ({ query, videos: await searchPublicVideos(query, maxResults) })));
  return {
    region: 'US', results,
    limitation: 'YouTube Data API provides public video examples, not monthly keyword search volume or keyword difficulty. Do not treat video counts or views as search-volume estimates.'
  };
}
