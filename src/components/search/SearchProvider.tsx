'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SearchAnalyticsEngine, SearchPerformanceMonitor } from '@/lib/search/analytics';
import { FuzzySearchEngine } from '@/lib/search/fuzzySearch';
import { SemanticSearchEngine } from '@/lib/search/semanticSearch';
import { MLAutocompleteEngine } from '@/lib/search/autocomplete';
import type { Book } from '@/lib/supabase';

// Type adapter for search engines
type SearchableBook = Omit<Book, 'description'> & {
  description?: string;
  [key: string]: any;
};
import { logger } from '@/lib/logger';

interface SearchContextType {
  // Search engines
  fuzzyEngine: FuzzySearchEngine<SearchableBook> | null;
  semanticEngine: SemanticSearchEngine<SearchableBook> | null;
  autocompleteEngine: MLAutocompleteEngine | null;
  analyticsEngine: SearchAnalyticsEngine;
  performanceMonitor: SearchPerformanceMonitor;
  
  // Search state
  isInitialized: boolean;
  searchResults: Book[];
  isSearching: boolean;
  searchQuery: string;
  searchStats: {
    totalResults: number;
    searchTime: number;
    correctedQuery?: string;
  };
  
  // Search methods
  initializeEngines: (books: Book[]) => Promise<void>;
  performSearch: (
    query: string, 
    options?: {
      mode?: 'fuzzy' | 'semantic' | 'hybrid';
      filters?: any;
    }
  ) => Promise<Book[]>;
  getSuggestions: (query: string) => string[];
  getRecommendations: (book: Book) => Book[];
  clearSearch: () => void;
  
  // Analytics methods
  trackSearch: (query: string, resultCount: number, searchTime: number) => string;
  trackInteraction: (eventId: string, interaction: any) => void;
  getAnalytics: () => any;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

interface SearchProviderProps {
  children: React.ReactNode;
  books?: Book[];
}

export function SearchProvider({ children, books = [] }: SearchProviderProps) {
  const [fuzzyEngine, setFuzzyEngine] = useState<FuzzySearchEngine<SearchableBook> | null>(null);
  const [semanticEngine, setSemanticEngine] = useState<SemanticSearchEngine<SearchableBook> | null>(null);
  const [autocompleteEngine, setAutocompleteEngine] = useState<MLAutocompleteEngine | null>(null);
  const [analyticsEngine] = useState(new SearchAnalyticsEngine());
  const [performanceMonitor] = useState(new SearchPerformanceMonitor());
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStats, setSearchStats] = useState<{
    totalResults: number;
    searchTime: number;
    correctedQuery?: string;
  }>({
    totalResults: 0,
    searchTime: 0,
    correctedQuery: undefined
  });

  // Initialize search engines
  const initializeEngines = useCallback(async (booksData: Book[]) => {
    if (booksData.length === 0) return;
    
    try {
      performanceMonitor.startMeasurement('engine-initialization');
      
      // Initialize engines in parallel
      const [fuzzy, semantic, autocomplete] = await Promise.all([
        Promise.resolve(new FuzzySearchEngine(booksData as SearchableBook[])),
        Promise.resolve(new SemanticSearchEngine(booksData as SearchableBook[])),
        Promise.resolve((() => {
          const engine = new MLAutocompleteEngine();
          booksData.forEach(book => {
            engine.addDocument(`${book.title} ${book.author} ${book.category}`, book.id);
          });
          return engine;
        })())
      ]);
      
      setFuzzyEngine(fuzzy);
      setSemanticEngine(semantic);
      setAutocompleteEngine(autocomplete);
      setIsInitialized(true);
      
      const initTime = performanceMonitor.endMeasurement('engine-initialization');
      logger.info(`Search engines initialized in ${initTime.toFixed(2)}ms`, { initTime });
      
    } catch (error) {
      logger.error('Failed to initialize search engines', error);
    }
  }, [performanceMonitor]);

  // Initialize engines when books change
  useEffect(() => {
    if (books.length > 0 && !isInitialized) {
      initializeEngines(books);
    }
  }, [books, isInitialized, initializeEngines]);

  // Perform search across all engines
  const performSearch = async (
    query: string, 
    options: {
      mode?: 'fuzzy' | 'semantic' | 'hybrid';
      filters?: any;
      maxResults?: number;
    } = {}
  ): Promise<Book[]> => {
    if (!isInitialized || !fuzzyEngine || !semanticEngine || !query.trim()) {
      return [];
    }

    const { mode = 'hybrid', filters = {}, maxResults = 20 } = options;
    
    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      const searchId = `search-${Date.now()}`;
      performanceMonitor.startMeasurement(searchId);
      
      let results: Book[] = [];
      let correctedQuery: string | undefined;
      
      // Apply filters to books if provided
      let searchableBooks = books;
      if (filters.categories?.length > 0 || filters.authors?.length > 0 || filters.priceRange) {
        searchableBooks = books.filter(book => {
          const categoryMatch = !filters.categories?.length || filters.categories.includes(book.category);
          const authorMatch = !filters.authors?.length || filters.authors.includes(book.author);
          // Skip price filtering since price field doesn't exist in current data
          
          return categoryMatch && authorMatch;
        });
        
        // Reinitialize engines with filtered data for this search
        const filteredFuzzy = new FuzzySearchEngine(searchableBooks as SearchableBook[]);
        const filteredSemantic = new SemanticSearchEngine(searchableBooks as SearchableBook[]);
        
        switch (mode) {
          case 'fuzzy':
            const fuzzyResults = filteredFuzzy.search(query, { 
              maxResults,
              enableTypoCorrection: true 
            });
            results = fuzzyResults.map(r => r.item as Book);
            correctedQuery = fuzzyResults[0]?.correctedQuery;
            break;
            
          case 'semantic':
            const semanticResults = filteredSemantic.semanticSearch(query, { maxResults });
            results = semanticResults.map(r => r.item as Book);
            break;
            
          case 'hybrid':
          default:
            // Combine both approaches for better results
            const hybridFuzzy = filteredFuzzy.search(query, { 
              maxResults: Math.floor(maxResults * 0.7),
              enableTypoCorrection: true 
            });
            const hybridSemantic = filteredSemantic.semanticSearch(query, { 
              maxResults: Math.floor(maxResults * 0.7)
            });
            
            // Merge and deduplicate results with scoring
            const combinedResults = new Map<string, { book: Book; score: number }>();
            
            hybridFuzzy.forEach((result, index) => {
              const boost = 1 - (index * 0.1); // Position boost
              combinedResults.set(result.item.id, {
                book: result.item as Book,
                score: result.score * 0.6 * boost
              });
            });
            
            hybridSemantic.forEach((result, index) => {
              const boost = 1 - (index * 0.1);
              const existing = combinedResults.get(result.item.id);
              if (existing) {
                existing.score += result.score * 0.8 * boost;
              } else {
                combinedResults.set(result.item.id, {
                  book: result.item as Book,
                  score: result.score * 0.8 * boost
                });
              }
            });
            
            results = Array.from(combinedResults.values())
              .sort((a, b) => b.score - a.score)
              .slice(0, maxResults)
              .map(r => r.book);
            
            correctedQuery = hybridFuzzy[0]?.correctedQuery;
            break;
        }
      } else {
        // Use full dataset
        switch (mode) {
          case 'fuzzy':
            const fuzzyResults = fuzzyEngine.search(query, { 
              maxResults,
              enableTypoCorrection: true 
            });
            results = fuzzyResults.map(r => r.item as Book);
            correctedQuery = fuzzyResults[0]?.correctedQuery;
            break;
            
          case 'semantic':
            const semanticResults = semanticEngine.semanticSearch(query, { maxResults });
            results = semanticResults.map(r => r.item as Book);
            break;
            
          case 'hybrid':
          default:
            const hybridFuzzy = fuzzyEngine.search(query, { 
              maxResults: Math.floor(maxResults * 0.7),
              enableTypoCorrection: true 
            });
            const hybridSemantic = semanticEngine.semanticSearch(query, { 
              maxResults: Math.floor(maxResults * 0.7)
            });
            
            const combinedResults = new Map<string, { book: Book; score: number }>();
            
            hybridFuzzy.forEach((result, index) => {
              const boost = 1 - (index * 0.1);
              combinedResults.set(result.item.id, {
                book: result.item as Book,
                score: result.score * 0.6 * boost
              });
            });
            
            hybridSemantic.forEach((result, index) => {
              const boost = 1 - (index * 0.1);
              const existing = combinedResults.get(result.item.id);
              if (existing) {
                existing.score += result.score * 0.8 * boost;
              } else {
                combinedResults.set(result.item.id, {
                  book: result.item as Book,
                  score: result.score * 0.8 * boost
                });
              }
            });
            
            results = Array.from(combinedResults.values())
              .sort((a, b) => b.score - a.score)
              .slice(0, maxResults)
              .map(r => r.book);
            
            correctedQuery = hybridFuzzy[0]?.correctedQuery;
            break;
        }
      }
      
      const searchTime = performanceMonitor.endMeasurement(searchId);
      
      // Update state
      setSearchResults(results);
      setSearchStats({
        totalResults: results.length,
        searchTime,
        correctedQuery
      });
      
      // Track analytics
      analyticsEngine.trackSearch(
        query, 
        results.length, 
        searchTime, 
        mode,
        filters,
        correctedQuery
      );
      
      return results;
      
    } catch (error) {
      logger.error('Search error', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Get autocomplete suggestions
  const getSuggestions = (query: string): string[] => {
    if (!autocompleteEngine || query.length < 2) return [];
    
    try {
      // Get both engine suggestions and personalized suggestions
      const engineSuggestions = autocompleteEngine.getSuggestions(query, { maxSuggestions: 3 });
      const personalizedSuggestions = analyticsEngine.getPersonalizedSuggestions(query, 2);
      
      // Combine and deduplicate
      const allSuggestions = [...engineSuggestions, ...personalizedSuggestions];
      const uniqueSuggestions = Array.from(new Set(allSuggestions));
      
      return uniqueSuggestions.slice(0, 5);
    } catch (error) {
      logger.error('Error getting suggestions', error);
      return [];
    }
  };

  // Get content-based recommendations
  const getRecommendations = (book: Book): Book[] => {
    if (!semanticEngine) return [];
    
    try {
      const recommendations = semanticEngine.getRecommendations(book as SearchableBook, 6);
      return recommendations.map(r => r.item as Book);
    } catch (error) {
      logger.error('Error getting recommendations', error);
      return [];
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
    setSearchStats({ totalResults: 0, searchTime: 0, correctedQuery: undefined });
  };

  // Track search event
  const trackSearch = (query: string, resultCount: number, searchTime: number): string => {
    return analyticsEngine.trackSearch(query, resultCount, searchTime, 'hybrid');
  };

  // Track user interaction
  const trackInteraction = (eventId: string, interaction: any) => {
    analyticsEngine.trackInteraction(eventId, interaction);
  };

  // Get analytics
  const getAnalytics = () => {
    return analyticsEngine.getAnalytics();
  };

  const contextValue: SearchContextType = {
    // Engines
    fuzzyEngine,
    semanticEngine,
    autocompleteEngine,
    analyticsEngine,
    performanceMonitor,
    
    // State
    isInitialized,
    searchResults,
    isSearching,
    searchQuery,
    searchStats,
    
    // Methods
    initializeEngines,
    performSearch,
    getSuggestions,
    getRecommendations,
    clearSearch,
    trackSearch,
    trackInteraction,
    getAnalytics
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}