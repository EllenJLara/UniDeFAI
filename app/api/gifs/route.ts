import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { requestQueue } from '@/lib/request-queue';

const TENOR_API_KEY = process.env.TENOR_API_KEY;
const TENOR_CLIENT_KEY = "unidefai_app";
const CACHE_TTL = 3600; 

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function fetchFromTenor(endpoint: string, params: Record<string, string>) {
  return requestQueue.add(async () => {
    const searchParams = new URLSearchParams({
      ...params,
      key: TENOR_API_KEY!,
      client_key: TENOR_CLIENT_KEY,
    });

    const response = await fetch(
      `https://tenor.googleapis.com/v2/${endpoint}?${searchParams}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`Tenor API error: ${response.statusText}`);
    }
    return response.json();
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '20';
    const pos = searchParams.get('pos');

    const cacheKey = query 
      ? `gif:search:${query}:${limit}:${pos || 0}`
      : `gif:trending:${limit}:${pos || 0}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const apiParams: Record<string, string> = { limit };
    if (pos) apiParams.pos = pos;

    const endpoint = query ? `search?q=${encodeURIComponent(query)}` : 'featured';
    const response = await fetchFromTenor(endpoint, apiParams);

    const processedResults = {
      results: response.results.map(gif => ({
        id: gif.id,
        url: gif.media_formats.gif.url,
        previewUrl: gif.media_formats.tinygif.url,
        width: gif.media_formats.gif.dims[0],
        height: gif.media_formats.gif.dims[1],
        description: gif.content_description
      })),
      next: response.next
    };

    if (!query || processedResults.results.length > 0) {
      await redis.set(cacheKey, processedResults, { ex: CACHE_TTL });
    }

    return NextResponse.json(processedResults);

  } catch (error) {
    console.error('GIF API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GIFs' },
      { status: 500 }
    );
  }
}