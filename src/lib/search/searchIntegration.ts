import { SemanticSearchEngine } from './semanticSearch';
import { FuzzySearchEngine } from './fuzzySearch';
import { searchService } from './searchService';
import type { Book } from '../supabase';
import type { SearchFilters } from './searchService';
import { logger } from '../logger';

export interface IntegratedSearchOptions {
  mode?: 'local' | 'supabase' | 'hybrid';
  algorithm?: 'fuzzy' | 'semantic' | 'hybrid';
  maxResults?: number;
  enableCache?: boolean;
  fallbackToLocal?: boolean;
}

export interface IntegratedSearchResult {
  books: Book[];
  source: 'local-fuzzy' | 'local-semantic' | 'local-hybrid' | 'supabase' | 'hybrid';
  totalResults: number;
  searchTime: number;
  cacheHit?: boolean;
  fallbackUsed?: boolean;
  relevanceScores?: number[];
}

class IntegratedSearchSystem {
  private fuzzyEngine: FuzzySearchEngine<Book>;
  private semanticEngine: SemanticSearchEngine<Book>;
  private searchCache: Map<string, IntegratedSearchResult> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.fuzzyEngine = new FuzzySearchEngine<Book>();
    this.semanticEngine = new SemanticSearchEngine<Book>();
  }

  /**
   * Initialize search engines with book data
   */
  initialize(books: Book[]): void {
    try {
      logger.search('Initializing integrated search system', { bookCount: books.length });
      
      this.fuzzyEngine.setItems(books);
      this.semanticEngine.setItems(books);
      
      // Clear cache on re-initialization
      this.searchCache.clear();
      this.cacheExpiry.clear();
      
      logger.search('Search system initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize search system', error);
      throw error;
    }
  }

  /**
   * Perform integrated search across all available methods
   */
  async search(
    query: string, 
    filters: SearchFilters = {}, 
    options: IntegratedSearchOptions = {}
  ): Promise<IntegratedSearchResult> {
    const startTime = performance.now();
    const cacheKey = this.getCacheKey(query, filters, options);
    
    try {
      // Check cache first
      if (options.enableCache !== false) {
        const cachedResult = this.getCachedResult(cacheKey);
        if (cachedResult) {
          logger.search('Search cache hit', { query, cacheKey });
          return { ...cachedResult, cacheHit: true };
        }
      }

      let result: IntegratedSearchResult;

      switch (options.mode || 'hybrid') {
        case 'local':
          result = await this.performLocalSearch(query, filters, options);
          break;
        case 'supabase':
          result = await this.performSupabaseSearch(query, filters, options);
          break;
        case 'hybrid':
        default:
          result = await this.performHybridSearch(query, filters, options);
          break;
      }

      result.searchTime = performance.now() - startTime;
      
      // Cache the result
      if (options.enableCache !== false) {
        this.setCachedResult(cacheKey, result);
      }

      logger.search('Search completed', {
        query,
        source: result.source,
        totalResults: result.totalResults,
        searchTime: result.searchTime
      });

      return result;
    } catch (error) {
      logger.error(`Search failed for query "${query}"`, error);
      
      // Return empty result on error
      return {
        books: [],
        source: 'local-fuzzy',
        totalResults: 0,
        searchTime: performance.now() - startTime,
        fallbackUsed: true
      };
    }
  }

  /**
   * Perform local search using fuzzy or semantic algorithms
   */
  private async performLocalSearch(
    query: string, 
    filters: SearchFilters, 
    options: IntegratedSearchOptions
  ): Promise<IntegratedSearchResult> {
    const algorithm = options.algorithm || 'hybrid';
    const maxResults = options.maxResults || 50;

    let books: Book[] = [];
    let relevanceScores: number[] = [];
    let source: IntegratedSearchResult['source'] = 'local-fuzzy';

    if (algorithm === 'fuzzy') {
      const results = this.fuzzyEngine.search(query, { maxResults });
      books = results.map(r => r.item);
      relevanceScores = results.map(r => r.score);
      source = 'local-fuzzy';
    } else if (algorithm === 'semantic') {
      const results = this.semanticEngine.semanticSearch(query, { maxResults });
      books = results.map(r => r.item);
      relevanceScores = results.map(r => r.score);
      source = 'local-semantic';
    } else {
      // Hybrid: combine fuzzy and semantic
      const fuzzyResults = this.fuzzyEngine.search(query, { maxResults: maxResults / 2 });
      const semanticResults = this.semanticEngine.semanticSearch(query, { maxResults: maxResults / 2 });
      
      // Merge and deduplicate results
      const combined = this.mergeSearchResults(fuzzyResults, semanticResults);
      books = combined.map(r => r.book);
      relevanceScores = combined.map(r => r.score);
      source = 'local-hybrid';
    }

    // Apply filters
    books = this.applyLocalFilters(books, filters);

    return {
      books,
      source,
      totalResults: books.length,
      searchTime: 0, // Will be set by caller
      relevanceScores
    };
  }

  /**
   * Perform Supabase search with fallback to local
   */
  private async performSupabaseSearch(
    query: string, 
    filters: SearchFilters, 
    options: IntegratedSearchOptions
  ): Promise<IntegratedSearchResult> {
    try {
      const response = await searchService.searchBooks(query, filters);
      
      return {
        books: response.results.map(r => r.book),
        source: 'supabase',
        totalResults: response.totalCount,
        searchTime: response.searchTime,
        relevanceScores: response.results.map(r => r.relevanceScore)
      };
    } catch (error) {
      logger.warn('Supabase search failed, falling back to local search', error);
      
      if (options.fallbackToLocal !== false) {
        const localResult = await this.performLocalSearch(query, filters, {
          ...options,
          algorithm: 'hybrid'
        });
        return {
          ...localResult,
          fallbackUsed: true
        };
      }
      
      throw error;
    }
  }

  /**
   * Perform hybrid search combining Supabase and local results
   */
  private async performHybridSearch(
    query: string, 
    filters: SearchFilters, 
    options: IntegratedSearchOptions
  ): Promise<IntegratedSearchResult> {
    try {
      // Try Supabase first
      const supabaseResult = await this.performSupabaseSearch(query, filters, {
        ...options,
        fallbackToLocal: false
      });
      
      // If we have good Supabase results, return them
      if (supabaseResult.totalResults > 0) {
        return supabaseResult;
      }
      
      // If no Supabase results, use local search
      logger.info('No Supabase results, using local search');
      const localResult = await this.performLocalSearch(query, filters, options);
      return {
        ...localResult,
        source: 'hybrid'
      };
      
    } catch (error) {
      // If Supabase fails, use local search
      logger.warn('Hybrid search falling back to local', error);
      const localResult = await this.performLocalSearch(query, filters, options);
      return {
        ...localResult,
        source: 'hybrid',
        fallbackUsed: true
      };
    }
  }

  /**
   * Get search suggestions using all available methods
   */
  async getSuggestions(partialQuery: string): Promise<string[]> {
    if (partialQuery.length < 2) return [];

    try {
      // Get Supabase suggestions first  
      const supabaseSuggestions: any[] = [];
      const suggestions = supabaseSuggestions.map(s => s.text);
      
      // Add local fuzzy suggestions as fallback
      if (suggestions.length < 5) {
        const localSuggestions = this.fuzzyEngine.getSuggestions(partialQuery, 10 - suggestions.length);
        suggestions.push(...localSuggestions);
      }
      
      // Remove duplicates and return
      return [...new Set(suggestions)];
    } catch (error) {
      logger.warn('Failed to get suggestions from Supabase, using local only', error);
      return this.fuzzyEngine.getSuggestions(partialQuery, 10);
    }
  }

  /**
   * Get content-based recommendations
   */
  getRecommendations(book: Book, maxRecommendations = 5): Book[] {
    try {
      const recommendations = this.semanticEngine.getRecommendations(book, maxRecommendations);
      return recommendations.map(r => r.item);
    } catch (error) {
      logger.error('Failed to get recommendations', error);
      return [];
    }
  }

  /**
   * Merge fuzzy and semantic search results with score normalization
   */
  private mergeSearchResults(
    fuzzyResults: Array<{ item: Book; score: number }>,
    semanticResults: Array<{ item: Book; score: number }>
  ): Array<{ book: Book; score: number }> {
    const combinedMap = new Map<string, { book: Book; score: number; sources: string[] }>();

    // Add fuzzy results
    fuzzyResults.forEach(result => {
      combinedMap.set(result.item.id, {
        book: result.item,
        score: result.score * 0.6, // Weight fuzzy results
        sources: ['fuzzy']
      });
    });

    // Add semantic results
    semanticResults.forEach(result => {
      const existing = combinedMap.get(result.item.id);
      if (existing) {
        // Combine scores for items found in both
        existing.score = (existing.score + result.score * 0.4) / 2;
        existing.sources.push('semantic');
      } else {
        combinedMap.set(result.item.id, {
          book: result.item,
          score: result.score * 0.4, // Weight semantic results
          sources: ['semantic']
        });
      }
    });

    // Convert to array and sort by combined score
    return Array.from(combinedMap.values())
      .sort((a, b) => b.score - a.score)
      .map(item => ({ book: item.book, score: item.score }));
  }

  /**
   * Apply filters to local search results
   */
  private applyLocalFilters(books: Book[], filters: SearchFilters): Book[] {
    let filtered = books;

    if (filters.categories?.length) {
      filtered = filtered.filter(book => filters.categories!.includes(book.category));
    }

    if (filters.authors?.length) {
      filtered = filtered.filter(book => filters.authors!.includes(book.author));
    }

    if (filters.availableOnly) {
      filtered = filtered.filter(book => book.available !== false);
    }

    if (filters.minRating && filters.minRating > 0) {
      filtered = filtered.filter(book => (book.rating || 0) >= filters.minRating!);
    }

    return filtered;
  }

  /**
   * Generate cache key for search parameters
   */
  private getCacheKey(query: string, filters: SearchFilters, options: IntegratedSearchOptions): string {
    const key = {
      query: query.toLowerCase().trim(),
      filters,
      options: {
        mode: options.mode,
        algorithm: options.algorithm,
        maxResults: options.maxResults
      }
    };
    return btoa(JSON.stringify(key));
  }

  /**
   * Get cached search result if valid
   */
  private getCachedResult(cacheKey: string): IntegratedSearchResult | null {
    const expiry = this.cacheExpiry.get(cacheKey);
    if (!expiry || Date.now() > expiry) {
      this.searchCache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
      return null;
    }

    return this.searchCache.get(cacheKey) || null;
  }

  /**
   * Cache search result with TTL
   */
  private setCachedResult(cacheKey: string, result: IntegratedSearchResult): void {
    this.searchCache.set(cacheKey, result);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

    // Clean up old cache entries periodically
    if (this.searchCache.size > 100) {
      this.cleanupCache();
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.searchCache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.searchCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get search analytics
   */
  getAnalytics(): {
    cacheSize: number;
    cacheHitRate: number;
    totalSearches: number;
  } {
    return {
      cacheSize: this.searchCache.size,
      cacheHitRate: 0, // Would need to implement hit rate tracking
      totalSearches: 0  // Would need to implement search count tracking
    };
  }
}

// Export singleton instance
export const integratedSearch = new IntegratedSearchSystem();