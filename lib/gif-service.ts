export interface GifResult {
  id: string;
  url: string;
  previewUrl: string;
  title?: string;
  width: number;
  height: number;
  description: string;
}

export interface GifSearchResponse {
  results: GifResult[];
  next?: string;
}

interface CacheEntry {
  data: GifSearchResponse;
  timestamp: number;
}

class GifService {
  private cache: Map<string, CacheEntry>;
  private CACHE_DURATION = 1000 * 60 * 15;
  private baseUrl: string;

  constructor() {
    this.cache = new Map();
    this.baseUrl = '/api/gifs';
  }

  private getCacheKey(type: 'search' | 'trending', query: string = '', limit: number, pos?: string): string {
    return `${type}:${query}:${limit}:${pos || ''}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  private async fetchGifs(params: URLSearchParams): Promise<GifSearchResponse> {
    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch GIFs: ${response.statusText}`);
    }
    return response.json();
  }

  async search(query: string, limit: number = 20, pos?: string): Promise<GifSearchResponse> {
    const cacheKey = this.getCacheKey('search', query, limit, pos);
    
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      ...(pos && { pos }),
    });

    const data = await this.fetchGifs(searchParams);
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  async trending(limit: number = 20, pos?: string): Promise<GifSearchResponse> {
    const cacheKey = this.getCacheKey('trending', '', limit, pos);
    
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    const searchParams = new URLSearchParams({
      limit: limit.toString(),
      ...(pos && { pos }),
    });

    const data = await this.fetchGifs(searchParams);
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }

  cleanExpiredCache(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.cache.delete(key);
      }
    }
  }
}

export const gifService = new GifService();