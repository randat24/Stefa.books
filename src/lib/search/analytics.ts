/**
 * Search Analytics and Optimization System
 * Tracks user search behavior and provides insights for search improvement
 */

import { logger } from '../logger';

interface SearchEvent {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
  searchTime: number;
  searchMode: 'fuzzy' | 'semantic' | 'hybrid';
  filters: {
    categories: string[];
    priceRange: [number, number];
    authors: string[];
  };
  userInteraction: {
    clicked: boolean;
    clickedItemId?: string;
    timeToClick?: number;
    scrollDepth: number;
  };
  correctedQuery?: string;
  sessionId: string;
}

interface SearchAnalytics {
  totalSearches: number;
  successfulSearches: number;
  averageSearchTime: number;
  popularQueries: Map<string, number>;
  popularFilters: Map<string, number>;
  searchModePreference: Map<string, number>;
  commonTypos: Map<string, string>;
  lowPerformingQueries: string[];
  peakSearchTimes: number[];
}

class SearchAnalyticsEngine {
  private events: SearchEvent[] = [];
  private sessionId: string;
  private readonly STORAGE_KEY = 'stefa_search_analytics';
  private readonly MAX_EVENTS = 1000; // Limit stored events

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadFromStorage();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.events = data.events || [];
        // Clean old events (older than 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        this.events = this.events.filter(event => event.timestamp > thirtyDaysAgo);
      }
    } catch (error) {
      logger.analytics('Failed to load search analytics', error);
      this.events = [];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Keep only the most recent events
      const recentEvents = this.events
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.MAX_EVENTS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        events: recentEvents,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      logger.analytics('Failed to save search analytics', error);
    }
  }

  // Track a new search event
  trackSearch(
    query: string,
    resultCount: number,
    searchTime: number,
    searchMode: 'fuzzy' | 'semantic' | 'hybrid',
    filters: any = {},
    correctedQuery?: string
  ): string {
    const eventId = this.generateEventId();
    
    const event: SearchEvent = {
      id: eventId,
      query: query.toLowerCase().trim(),
      timestamp: Date.now(),
      resultCount,
      searchTime,
      searchMode,
      filters: {
        categories: filters.categories || [],
        priceRange: filters.priceRange || [0, 1000],
        authors: filters.authors || []
      },
      userInteraction: {
        clicked: false,
        scrollDepth: 0
      },
      correctedQuery,
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.saveToStorage();
    
    return eventId;
  }

  // Track user interaction with search results
  trackInteraction(
    eventId: string,
    interaction: {
      clicked?: boolean;
      clickedItemId?: string;
      timeToClick?: number;
      scrollDepth?: number;
    }
  ): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      Object.assign(event.userInteraction, interaction);
      this.saveToStorage();
    }
  }

  // Generate comprehensive analytics report
  getAnalytics(): SearchAnalytics {
    // const now = Date.now(); // Will be used for recent events filtering
    // const oneDayAgo = now - (24 * 60 * 60 * 1000); // Will be used for recent events filtering
    // const recentEvents = this.events.filter(e => e.timestamp > oneDayAgo);

    // Basic metrics
    const totalSearches = this.events.length;
    const successfulSearches = this.events.filter(e => e.resultCount > 0).length;
    const averageSearchTime = this.events.reduce((sum, e) => sum + e.searchTime, 0) / totalSearches || 0;

    // Popular queries
    const popularQueries = new Map<string, number>();
    this.events.forEach(event => {
      const count = popularQueries.get(event.query) || 0;
      popularQueries.set(event.query, count + 1);
    });

    // Popular filters
    const popularFilters = new Map<string, number>();
    this.events.forEach(event => {
      event.filters.categories.forEach(category => {
        const count = popularFilters.get(`category:${category}`) || 0;
        popularFilters.set(`category:${category}`, count + 1);
      });
      
      event.filters.authors.forEach(author => {
        const count = popularFilters.get(`author:${author}`) || 0;
        popularFilters.set(`author:${author}`, count + 1);
      });
    });

    // Search mode preferences
    const searchModePreference = new Map<string, number>();
    this.events.forEach(event => {
      const count = searchModePreference.get(event.searchMode) || 0;
      searchModePreference.set(event.searchMode, count + 1);
    });

    // Common typos
    const commonTypos = new Map<string, string>();
    this.events.forEach(event => {
      if (event.correctedQuery && event.correctedQuery !== event.query) {
        commonTypos.set(event.query, event.correctedQuery);
      }
    });

    // Low performing queries (no results or no clicks)
    const lowPerformingQueries = this.events
      .filter(e => e.resultCount === 0 || !e.userInteraction.clicked)
      .map(e => e.query)
      .filter((query, index, self) => self.indexOf(query) === index);

    // Peak search times (hours of day)
    const peakSearchTimes: number[] = new Array(24).fill(0);
    this.events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      peakSearchTimes[hour]++;
    });

    return {
      totalSearches,
      successfulSearches,
      averageSearchTime,
      popularQueries,
      popularFilters,
      searchModePreference,
      commonTypos,
      lowPerformingQueries: lowPerformingQueries.slice(0, 10),
      peakSearchTimes
    };
  }

  // Get search suggestions based on user behavior
  getPersonalizedSuggestions(currentQuery: string, limit = 5): string[] {
    const userQueries = this.events
      .filter(e => e.sessionId === this.sessionId)
      .map(e => e.query);

    // const allQueries = this.events
    //   .filter(e => e.resultCount > 0 && e.userInteraction.clicked)
    //   .map(e => e.query);

    // Find queries similar to current input
    const suggestions = new Set<string>();
    const queryLower = currentQuery.toLowerCase();

    // Add user's previous successful queries
    userQueries
      .filter(q => q.includes(queryLower) && q !== queryLower)
      .slice(0, limit)
      .forEach(q => suggestions.add(q));

    // Add popular queries that match
    const popularEntries = Array.from(this.getAnalytics().popularQueries.entries())
      .sort(([, a], [, b]) => b - a);

    popularEntries
      .filter(([query]) => query.includes(queryLower) && query !== queryLower)
      .slice(0, limit - suggestions.size)
      .forEach(([query]) => suggestions.add(query));

    return Array.from(suggestions).slice(0, limit);
  }

  // Get performance insights for search optimization
  getPerformanceInsights(): {
    slowQueries: Array<{ query: string; averageTime: number; frequency: number }>;
    noResultQueries: Array<{ query: string; frequency: number }>;
    popularCategories: string[];
    searchModeEffectiveness: Map<string, number>;
  } {
    // Slow queries
    const queryTimes = new Map<string, { total: number; count: number }>();
    this.events.forEach(event => {
      const existing = queryTimes.get(event.query) || { total: 0, count: 0 };
      queryTimes.set(event.query, {
        total: existing.total + event.searchTime,
        count: existing.count + 1
      });
    });

    const slowQueries = Array.from(queryTimes.entries())
      .map(([query, data]) => ({
        query,
        averageTime: data.total / data.count,
        frequency: data.count
      }))
      .filter(item => item.averageTime > 100 && item.frequency > 2)
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    // No result queries
    const noResultCounts = new Map<string, number>();
    this.events
      .filter(e => e.resultCount === 0)
      .forEach(event => {
        const count = noResultCounts.get(event.query) || 0;
        noResultCounts.set(event.query, count + 1);
      });

    const noResultQueries = Array.from(noResultCounts.entries())
      .map(([query, frequency]) => ({ query, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Popular categories
    const categoryCounts = new Map<string, number>();
    this.events.forEach(event => {
      event.filters.categories.forEach(category => {
        const count = categoryCounts.get(category) || 0;
        categoryCounts.set(category, count + 1);
      });
    });

    const popularCategories = Array.from(categoryCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    // Search mode effectiveness
    const modeEffectiveness = new Map<string, number>();
    ['fuzzy', 'semantic', 'hybrid'].forEach(mode => {
      const modeEvents = this.events.filter(e => e.searchMode === mode);
      const successRate = modeEvents.length > 0 
        ? modeEvents.filter(e => e.resultCount > 0).length / modeEvents.length 
        : 0;
      modeEffectiveness.set(mode, successRate);
    });

    return {
      slowQueries,
      noResultQueries,
      popularCategories,
      searchModeEffectiveness: modeEffectiveness
    };
  }

  // Clear analytics data
  clearAnalytics(): void {
    this.events = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Export analytics data for external analysis
  exportAnalytics(): string {
    const analytics = this.getAnalytics();
    const insights = this.getPerformanceInsights();
    
    const exportData = {
      summary: {
        totalSearches: analytics.totalSearches,
        successRate: analytics.successfulSearches / analytics.totalSearches,
        averageSearchTime: analytics.averageSearchTime
      },
      popularQueries: Array.from(analytics.popularQueries.entries()).slice(0, 20),
      searchModes: Array.from(analytics.searchModePreference.entries()),
      performance: {
        slowQueries: insights.slowQueries,
        noResultQueries: insights.noResultQueries
      },
      userBehavior: {
        peakHours: analytics.peakSearchTimes
          .map((count, hour) => ({ hour, count }))
          .filter(item => item.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      },
      exportTime: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  private generateEventId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

// Search Performance Monitor
class SearchPerformanceMonitor {
  private performanceEntries: Map<string, number> = new Map();

  startMeasurement(id: string): void {
    this.performanceEntries.set(id, performance.now());
  }

  endMeasurement(id: string): number {
    const startTime = this.performanceEntries.get(id);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceEntries.delete(id);
      return duration;
    }
    return 0;
  }

  measureAsync<T>(id: string, asyncOperation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    return new Promise(async (resolve) => {
      this.startMeasurement(id);
      const result = await asyncOperation();
      const duration = this.endMeasurement(id);
      resolve({ result, duration });
    });
  }
}

export { SearchAnalyticsEngine, SearchPerformanceMonitor, type SearchEvent, type SearchAnalytics };