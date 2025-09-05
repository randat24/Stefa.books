import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Book } from '@/lib/supabase';

export interface SearchFilters {
  categories?: string[];
  authors?: string[];
  availableOnly?: boolean;
  minRating?: number;
  maxResults?: number;
}

export interface SearchResult {
  book: Book;
  relevanceScore: number;
  matchType: 'exact' | 'fuzzy' | 'semantic';
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchTime: number;
  suggestions: SearchSuggestion[];
  analytics: SearchAnalytics;
}

export interface SearchSuggestion {
  text: string;
  type: 'title' | 'author' | 'category';
  count: number;
}

export interface SearchAnalytics {
  queryId: string;
  processingTime: number;
  indexHits: number;
  fuzzyMatches: number;
}

class SearchService {
  private analytics: Map<string, SearchAnalytics> = new Map();

  /**
   * Advanced search with full-text capabilities
   */
  async searchBooks(
    query: string,
    filters: SearchFilters = {},
    offset: number = 0
  ): Promise<SearchResponse> {
    const startTime = performance.now();
    const queryId = crypto.randomUUID();

    try {
      logger.search(`Starting search for: "${query}"`, { 
        query, 
        filters, 
        offset,
        queryId 
      });

      // If no query, return filtered results
      if (!query.trim()) {
        return { results: [], searchTime: 0 } as any;
      }

      // Use Supabase RPC function for advanced search
      const { data: searchResults, error } = await (supabase as any).rpc('search_books', {
        query_text: query,
        limit_count: filters.maxResults || 50
      });

      if (error) {
        logger.error('Search error:', error);
        throw error;
      }

      // Get suggestions for partial matches
      const suggestions: any[] = [];

      const searchTime = performance.now() - startTime;

      // Convert results to SearchResult format
      const results: SearchResult[] = (searchResults || []).map((result: any) => ({
        book: result as any,
        relevanceScore: 1.0,
        matchType: 'exact' as any
      }));

      // Track search analytics
      await this.trackSearch(query, results.length, searchTime, filters);

      const analytics: SearchAnalytics = {
        queryId,
        processingTime: searchTime,
        indexHits: results.length,
        fuzzyMatches: results.filter(r => r.matchType === 'fuzzy').length
      };

      logger.search(`Search completed: ${results.length} results in ${searchTime.toFixed(1)}ms`, {
        queryId,
        resultsCount: results.length,
        searchTime
      });

      return {
        results,
        totalCount: results.length,
        searchTime,
        suggestions,
        analytics
      };

    } catch (error) {
      // const errorTime = performance.now() - startTime;
      logger.error('Search failed:', error);
      
      // Fallback to simple search
      return this.fallbackSearch(query, filters, offset);
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSearchSuggestions(partialQuery: string): Promise<SearchSuggestion[]> {
    if (partialQuery.length < 2) return [];

    try {
      const { data, error } = await (supabase as any).rpc('get_search_suggestions', {
        partial_query: partialQuery,
        limit_count: 10
      });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        text: item.suggestion,
        type: item.type as 'title' | 'author' | 'category',
        count: item.count
      }));

    } catch (error) {
      logger.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Get filtered books without search query
   */
  private async getFilteredBooks(
    filters: SearchFilters,
    offset: number
  ): Promise<SearchResponse> {
    const startTime = performance.now();

    try {
      let query = supabase
        .from('books')
        .select('*')
        .order('rating', { ascending: false })
        .order('title')
        .range(offset, offset + (filters.maxResults || 50) - 1);

      // Apply filters
      if (filters.categories?.length) {
        query = query.in('category', filters.categories);
      }

      if (filters.authors?.length) {
        query = query.in('author', filters.authors);
      }

      if (filters.availableOnly) {
        query = query.eq('available', true);
      }

      if (filters.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      const { data, error } = await query;

      if (error) throw error;

      const searchTime = performance.now() - startTime;

      const results: SearchResult[] = (data || []).map(book => ({
        book,
        relevanceScore: (book as any).rating || 0,
        matchType: 'exact' as const
      }));

      return {
        results,
        totalCount: results.length,
        searchTime,
        suggestions: [],
        analytics: {
          queryId: crypto.randomUUID(),
          processingTime: searchTime,
          indexHits: results.length,
          fuzzyMatches: 0
        }
      };

    } catch (error) {
      logger.error('Failed to get filtered books:', error);
      return {
        results: [],
        totalCount: 0,
        searchTime: performance.now() - startTime,
        suggestions: [],
        analytics: {
          queryId: crypto.randomUUID(),
          processingTime: 0,
          indexHits: 0,
          fuzzyMatches: 0
        }
      };
    }
  }

  /**
   * Fallback search using simple text matching
   */
  private async fallbackSearch(
    query: string,
    filters: SearchFilters,
    offset: number
  ): Promise<SearchResponse> {
    logger.warn('Using fallback search method');
    
    const startTime = performance.now();

    try {
      let dbQuery = supabase
        .from('books')
        .select('*');

      // Simple text search using ILIKE
      const searchTerm = `%${query}%`;
      dbQuery = dbQuery.or(`title.ilike.${searchTerm},author.ilike.${searchTerm},category.ilike.${searchTerm}`);

      // Apply filters
      if (filters.categories?.length) {
        dbQuery = dbQuery.in('category', filters.categories);
      }

      if (filters.authors?.length) {
        dbQuery = dbQuery.in('author', filters.authors);
      }

      if (filters.availableOnly) {
        dbQuery = dbQuery.eq('available', true);
      }

      dbQuery = dbQuery
        .order('rating', { ascending: false })
        .range(offset, offset + (filters.maxResults || 50) - 1);

      const { data, error } = await dbQuery;

      if (error) throw error;

      const searchTime = performance.now() - startTime;

      const results: SearchResult[] = (data || []).map(book => ({
        book,
        relevanceScore: this.calculateFallbackRelevance(query, book),
        matchType: 'fuzzy' as const
      }));

      // Sort by relevance
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return {
        results,
        totalCount: results.length,
        searchTime,
        suggestions: [],
        analytics: {
          queryId: crypto.randomUUID(),
          processingTime: searchTime,
          indexHits: results.length,
          fuzzyMatches: results.length
        }
      };

    } catch (error) {
      logger.error('Fallback search failed:', error);
      return {
        results: [],
        totalCount: 0,
        searchTime: performance.now() - startTime,
        suggestions: [],
        analytics: {
          queryId: crypto.randomUUID(),
          processingTime: 0,
          indexHits: 0,
          fuzzyMatches: 0
        }
      };
    }
  }

  /**
   * Calculate relevance score for fallback search
   */
  private calculateFallbackRelevance(query: string, book: Book): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    // Exact title match
    if (book.title.toLowerCase() === lowerQuery) score += 10;
    else if (book.title.toLowerCase().includes(lowerQuery)) score += 8;

    // Author match
    if (book.author.toLowerCase() === lowerQuery) score += 7;
    else if (book.author.toLowerCase().includes(lowerQuery)) score += 5;

    // Category match
    if (book.category_id.toLowerCase() === lowerQuery) score += 6;
    else if (book.category_id.toLowerCase().includes(lowerQuery)) score += 4;

    // Description match
    if (book.description && book.description.toLowerCase().includes(lowerQuery)) score += 2;
    if (book.short_description && book.short_description.toLowerCase().includes(lowerQuery)) score += 1;

    // Rating bonus
    score += (book.rating || 0) / 5 * 0.5;

    // Availability bonus
    if (book.available) score += 0.2;

    return score;
  }

  /**
   * Determine match type based on query and result
   */
  private determineMatchType(query: string, result: any): 'exact' | 'fuzzy' | 'semantic' {
    const lowerQuery = query.toLowerCase();
    
    if (
      result.title.toLowerCase() === lowerQuery ||
      result.author.toLowerCase() === lowerQuery ||
      result.category.toLowerCase() === lowerQuery
    ) {
      return 'exact';
    }

    if (result.relevance_score > 5) {
      return 'semantic';
    }

    return 'fuzzy';
  }

  /**
   * Track search query for analytics
   */
  private async trackSearch(
    query: string,
    resultsCount: number,
    searchTime: number,
    filters: SearchFilters
  ): Promise<void> {
    try {
      await (supabase
        .from('search_queries') as any)
        .insert({
          query,
          results_count: resultsCount,
          search_time_ms: searchTime,
          filters: filters as any,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        });
    } catch (error) {
      // Don't fail search if analytics fail
      logger.warn('Failed to track search analytics:', error);
    }
  }

  /**
   * Get popular search queries for analytics
   */
  async getPopularSearches(limit: number = 10): Promise<Array<{ query: string; count: number }>> {
    try {
      const { data, error } = await supabase
        .from('search_queries')
        .select('query')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .limit(1000);

      if (error) throw error;

      // Count query frequencies
      const queryCounts = (data || []).reduce((acc: any, item: any) => {
        acc[item.query] = (acc[item.query] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(queryCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, limit)
        .map(([query, count]) => ({ query, count: count as number }));

    } catch (error) {
      logger.error('Failed to get popular searches:', error);
      return [];
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();