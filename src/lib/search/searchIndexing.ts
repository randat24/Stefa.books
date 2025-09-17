/**
 * Advanced Search Indexing System
 * Provides efficient indexing, caching, and optimization for search operations
 */

import { logger } from '../logger';
import type { Book } from '../supabase';
import type { SearchFilters } from './searchService';

export interface SearchIndex {
  id: string;
  terms: string[];
  content: string;
  metadata: {
    category: string;
    author: string;
    rating: number;
    available: boolean;
    tags?: string[];
  };
  searchVector: number[];
  lastUpdated: number;
}

export interface IndexStats {
  totalDocuments: number;
  totalTerms: number;
  indexSize: number;
  lastRebuild: number;
  avgTermsPerDocument: number;
  memoryUsage: number;
}

export interface IndexingOptions {
  enablePersistence?: boolean;
  maxCacheSize?: number;
  rebuildInterval?: number;
  optimizationLevel?: 'basic' | 'standard' | 'aggressive';
  enableCompression?: boolean;
}

class SearchIndexingSystem {
  private indexes: Map<string, SearchIndex> = new Map();
  private termFrequency: Map<string, Map<string, number>> = new Map(); // term -> docId -> frequency
  private documentFrequency: Map<string, number> = new Map(); // term -> document count
  private inverseDocumentIndex: Map<string, Set<string>> = new Map(); // term -> document IDs
  private categoryIndex: Map<string, Set<string>> = new Map(); // category -> document IDs
  private authorIndex: Map<string, Set<string>> = new Map(); // author -> document IDs
  private ratingIndex: Map<number, Set<string>> = new Map(); // rating -> document IDs
  
  private options: Required<IndexingOptions>;
  private lastRebuild: number = 0;
  private indexingInProgress: boolean = false;
  private persistenceEnabled: boolean = false;

  private readonly stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'та', 'і', 'в', 'на', 'з',
    'для', 'про', 'це', 'який', 'яка', 'які', 'що', 'як', 'або'
  ]);

  constructor(options: IndexingOptions = {}) {
    this.options = {
      enablePersistence: options.enablePersistence ?? false,
      maxCacheSize: options.maxCacheSize ?? 10000,
      rebuildInterval: options.rebuildInterval ?? 24 * 60 * 60 * 1000, // 24 hours
      optimizationLevel: options.optimizationLevel ?? 'standard',
      enableCompression: options.enableCompression ?? false
    };
    
    this.persistenceEnabled = this.options.enablePersistence;
    
    // Load persisted indexes if enabled
    if (this.persistenceEnabled) {
      this.loadPersistedIndexes();
    }

    logger.info('Search indexing system initialized', { options: this.options });
  }

  /**
   * Build or rebuild the entire search index
   */
  async buildIndex(books: Book[], forceRebuild: boolean = false): Promise<void> {
    if (this.indexingInProgress) {
      logger.warn('Index building already in progress');
      return;
    }

    const shouldRebuild = forceRebuild || 
      this.shouldRebuildIndex() || 
      this.indexes.size === 0;

    if (!shouldRebuild) {
      logger.debug('Index rebuild not needed');
      return;
    }

    this.indexingInProgress = true;
    const startTime = performance.now();

    try {
      logger.info('Starting search index build', { 
        bookCount: books.length, 
        forceRebuild 
      });

      // Clear existing indexes
      this.clearIndexes();

      // Process books in batches for better performance
      const batchSize = 100;
      for (let i = 0; i < books.length; i += batchSize) {
        const batch = books.slice(i, i + batchSize);
        await this.processBatch(batch);
        
        // Allow other operations to run
        if (i % (batchSize * 5) === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Build auxiliary indexes
      await this.buildAuxiliaryIndexes();

      // Optimize indexes based on configuration
      await this.optimizeIndexes();

      // Persist indexes if enabled
      if (this.persistenceEnabled) {
        await this.persistIndexes();
      }

      const buildTime = performance.now() - startTime;
      this.lastRebuild = Date.now();

      logger.info('Search index build completed', {
        totalDocuments: this.indexes.size,
        totalTerms: this.documentFrequency.size,
        buildTime: Math.round(buildTime),
        memoryUsage: this.estimateMemoryUsage()
      });

    } catch (error) {
      logger.error('Failed to build search index', error);
      throw error;
    } finally {
      this.indexingInProgress = false;
    }
  }

  /**
   * Add or update a single document in the index
   */
  async updateDocument(book: Book): Promise<void> {
    try {
      const oldIndex = this.indexes.get(book.id);
      
      // Remove old document from indexes if it exists
      if (oldIndex) {
        this.removeDocumentFromIndexes(book.id, oldIndex);
      }

      // Create new index for the document
      const newIndex = this.createDocumentIndex(book);
      this.indexes.set(book.id, newIndex);

      // Update inverted indexes
      this.updateInvertedIndexes(book.id, newIndex);

      // Update auxiliary indexes
      this.updateAuxiliaryIndexes(book.id, newIndex);

      logger.debug('Document index updated', { bookId: book.id });

    } catch (error) {
      logger.error(`Failed to update document index for book ${book.id}`, error);
      throw error;
    }
  }

  /**
   * Remove a document from the index
   */
  async removeDocument(bookId: string): Promise<void> {
    try {
      const index = this.indexes.get(bookId);
      if (!index) {
        logger.warn('Document not found in index', { bookId });
        return;
      }

      // Remove from all indexes
      this.removeDocumentFromIndexes(bookId, index);
      this.indexes.delete(bookId);

      logger.debug('Document removed from index', { bookId });

    } catch (error) {
      logger.error(`Failed to remove document from index for book ${bookId}`, error);
      throw error;
    }
  }

  /**
   * Search using the built indexes
   */
  async searchIndex(
    query: string, 
    filters: SearchFilters = {}, 
    options: {
      maxResults?: number;
      scoreThreshold?: number;
      useIntersection?: boolean;
    } = {}
  ): Promise<Array<{ bookId: string; score: number; matches: string[] }>> {
    const { maxResults = 50, scoreThreshold = 0.1, useIntersection = true } = options;

    if (!query.trim()) {
      return [];
    }

    try {
      const queryTerms = this.tokenizeQuery(query);
      let candidateIds = new Set<string>();

      // Get candidate documents using inverted index
      if (useIntersection && queryTerms.length > 1) {
        // Intersection of all terms (more precise)
        candidateIds = this.getIntersectionCandidates(queryTerms);
      } else {
        // Union of all terms (more recall)
        candidateIds = this.getUnionCandidates(queryTerms);
      }

      // Apply filters to reduce candidate set
      candidateIds = this.applyFiltersToIndex(candidateIds, filters);

      // Score and rank candidates
      const scoredResults = this.scoreDocuments(candidateIds, queryTerms, query);

      // Filter by score threshold and limit results
      return scoredResults
        .filter(result => result.score >= scoreThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

    } catch (error) {
      logger.error(`Index search failed for query "${query}"`, error);
      return [];
    }
  }

  /**
   * Get search suggestions using the index
   */
  getSuggestions(partialQuery: string, maxSuggestions: number = 10): string[] {
    if (partialQuery.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();
    const lowerQuery = partialQuery.toLowerCase();

    // Find terms that start with the query
    for (const term of this.documentFrequency.keys()) {
      if (term.startsWith(lowerQuery)) {
        suggestions.add(term);
        if (suggestions.size >= maxSuggestions) break;
      }
    }

    // If not enough suggestions, find terms that contain the query
    if (suggestions.size < maxSuggestions) {
      for (const term of this.documentFrequency.keys()) {
        if (term.includes(lowerQuery) && !suggestions.has(term)) {
          suggestions.add(term);
          if (suggestions.size >= maxSuggestions) break;
        }
      }
    }

    // Sort by document frequency (popularity)
    return Array.from(suggestions)
      .sort((a, b) => (this.documentFrequency.get(b) || 0) - (this.documentFrequency.get(a) || 0))
      .slice(0, maxSuggestions);
  }

  /**
   * Get index statistics
   */
  getStats(): IndexStats {
    const totalTerms = this.documentFrequency.size;
    const totalDocuments = this.indexes.size;
    const avgTermsPerDocument = totalDocuments > 0 
      ? Array.from(this.indexes.values()).reduce((sum, idx) => sum + idx.terms.length, 0) / totalDocuments 
      : 0;

    return {
      totalDocuments,
      totalTerms,
      indexSize: this.indexes.size,
      lastRebuild: this.lastRebuild,
      avgTermsPerDocument: Math.round(avgTermsPerDocument * 100) / 100,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Optimize indexes for better performance
   */
  private async optimizeIndexes(): Promise<void> {
    const { optimizationLevel } = this.options;

    logger.debug('Starting index optimization', { level: optimizationLevel });

    if (optimizationLevel === 'basic') {
      // Basic optimization: just cleanup
      this.cleanupEmptyIndexes();
    } else if (optimizationLevel === 'standard') {
      // Standard optimization
      this.cleanupEmptyIndexes();
      this.optimizeTermFrequency();
    } else if (optimizationLevel === 'aggressive') {
      // Aggressive optimization
      this.cleanupEmptyIndexes();
      this.optimizeTermFrequency();
      await this.compressIndexes();
    }

    logger.debug('Index optimization completed');
  }

  /**
   * Process a batch of books for indexing
   */
  private async processBatch(books: Book[]): Promise<void> {
    for (const book of books) {
      const index = this.createDocumentIndex(book);
      this.indexes.set(book.id, index);
      this.updateInvertedIndexes(book.id, index);
    }
  }

  /**
   * Create search index for a single document
   */
  private createDocumentIndex(book: Book): SearchIndex {
    const content = [
      book.title,
      book.author,
      book.category,
      book.description || '',
      book.short_description || '',
      ...(book.tags || [])
    ].join(' ');

    const terms = this.tokenizeContent(content);
    const searchVector = this.createSearchVector(terms);

    return {
      id: book.id,
      terms,
      content: content.toLowerCase(),
      metadata: {
        category: book.category || 'Без категорії',
        author: book.author,
        rating: book.rating || 0,
        available: (book.qty_available || 0) > 0 && book.is_active !== false,
        tags: book.tags || undefined
      },
      searchVector,
      lastUpdated: Date.now()
    };
  }

  /**
   * Tokenize and clean content
   */
  private tokenizeContent(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\sа-яёіїєґ]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  /**
   * Tokenize search query
   */
  private tokenizeQuery(query: string): string[] {
    return this.tokenizeContent(query);
  }

  /**
   * Create search vector using TF-IDF
   */
  private createSearchVector(terms: string[]): number[] {
    const termCounts = new Map<string, number>();
    terms.forEach(term => {
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    });

    const vector: number[] = [];
    const totalDocs = this.indexes.size || 1;

    for (const [term, count] of termCounts) {
      const tf = count / terms.length;
      const df = this.documentFrequency.get(term) || 1;
      const idf = Math.log(totalDocs / df);
      vector.push(tf * idf);
    }

    return vector;
  }

  /**
   * Update inverted indexes
   */
  private updateInvertedIndexes(bookId: string, index: SearchIndex): void {
    // Update term frequency
    const termFreq = new Map<string, number>();
    index.terms.forEach(term => {
      termFreq.set(term, (termFreq.get(term) || 0) + 1);
    });
    this.termFrequency.set(bookId, termFreq);

    // Update document frequency and inverted index
    index.terms.forEach(term => {
      this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
      
      if (!this.inverseDocumentIndex.has(term)) {
        this.inverseDocumentIndex.set(term, new Set());
      }
      this.inverseDocumentIndex.get(term)!.add(bookId);
    });
  }

  /**
   * Build auxiliary indexes for filters
   */
  private async buildAuxiliaryIndexes(): Promise<void> {
    this.categoryIndex.clear();
    this.authorIndex.clear();
    this.ratingIndex.clear();

    for (const [bookId, index] of this.indexes) {
      this.updateAuxiliaryIndexes(bookId, index);
    }
  }

  /**
   * Update auxiliary indexes for a document
   */
  private updateAuxiliaryIndexes(bookId: string, index: SearchIndex): void {
    // Category index
    const category = index.metadata.category;
    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, new Set());
    }
    this.categoryIndex.get(category)!.add(bookId);

    // Author index
    const author = index.metadata.author;
    if (!this.authorIndex.has(author)) {
      this.authorIndex.set(author, new Set());
    }
    this.authorIndex.get(author)!.add(bookId);

    // Rating index (rounded to nearest 0.5)
    const rating = Math.round(index.metadata.rating * 2) / 2;
    if (!this.ratingIndex.has(rating)) {
      this.ratingIndex.set(rating, new Set());
    }
    this.ratingIndex.get(rating)!.add(bookId);
  }

  /**
   * Get intersection of document sets for multiple terms
   */
  private getIntersectionCandidates(queryTerms: string[]): Set<string> {
    if (queryTerms.length === 0) return new Set();

    let candidates = this.inverseDocumentIndex.get(queryTerms[0]) || new Set();
    
    for (let i = 1; i < queryTerms.length; i++) {
      const termDocs = this.inverseDocumentIndex.get(queryTerms[i]) || new Set();
      candidates = new Set([...candidates].filter(id => termDocs.has(id)));
    }

    return candidates;
  }

  /**
   * Get union of document sets for multiple terms
   */
  private getUnionCandidates(queryTerms: string[]): Set<string> {
    const candidates = new Set<string>();

    queryTerms.forEach(term => {
      const termDocs = this.inverseDocumentIndex.get(term) || new Set();
      termDocs.forEach(id => candidates.add(id));
    });

    return candidates;
  }

  /**
   * Apply filters to candidate set using auxiliary indexes
   */
  private applyFiltersToIndex(candidates: Set<string>, filters: SearchFilters): Set<string> {
    let filtered = new Set(candidates);

    if (filters.categories?.length) {
      const categoryIds = new Set<string>();
      filters.categories.forEach(category => {
        const categoryDocs = this.categoryIndex.get(category) || new Set();
        categoryDocs.forEach(id => categoryIds.add(id));
      });
      filtered = new Set([...filtered].filter(id => categoryIds.has(id)));
    }

    if (filters.authors?.length) {
      const authorIds = new Set<string>();
      filters.authors.forEach(author => {
        const authorDocs = this.authorIndex.get(author) || new Set();
        authorDocs.forEach(id => authorIds.add(id));
      });
      filtered = new Set([...filtered].filter(id => authorIds.has(id)));
    }

    if (filters.availableOnly) {
      filtered = new Set([...filtered].filter(id => {
        const index = this.indexes.get(id);
        return index?.metadata.available === true;
      }));
    }

    if (filters.minRating && filters.minRating > 0) {
      filtered = new Set([...filtered].filter(id => {
        const index = this.indexes.get(id);
        return (index?.metadata.rating || 0) >= filters.minRating!;
      }));
    }

    return filtered;
  }

  /**
   * Score documents based on query terms
   */
  private scoreDocuments(
    candidates: Set<string>, 
    queryTerms: string[], 
    originalQuery: string
  ): Array<{ bookId: string; score: number; matches: string[] }> {
    const results: Array<{ bookId: string; score: number; matches: string[] }> = [];

    for (const bookId of candidates) {
      const index = this.indexes.get(bookId);
      if (!index) continue;

      let score = 0;
      const matches: string[] = [];

      // TF-IDF scoring
      queryTerms.forEach(term => {
        const termFreq = this.termFrequency.get(bookId)?.get(term) || 0;
        if (termFreq > 0) {
          const tf = termFreq / index.terms.length;
          const df = this.documentFrequency.get(term) || 1;
          const idf = Math.log(this.indexes.size / df);
          score += tf * idf;
          matches.push(term);
        }
      });

      // Boost score for exact content matches
      if (index.content.includes(originalQuery.toLowerCase())) {
        score *= 1.5;
      }

      // Boost score for title matches
      if (index.content.includes(queryTerms.join(' '))) {
        score *= 1.2;
      }

      // Boost score for higher ratings
      score += (index.metadata.rating / 5) * 0.1;

      // Boost score for available books
      if (index.metadata.available) {
        score *= 1.05;
      }

      results.push({ bookId, score, matches });
    }

    return results;
  }

  /**
   * Remove document from all indexes
   */
  private removeDocumentFromIndexes(bookId: string, index: SearchIndex): void {
    // Remove from inverted indexes
    index.terms.forEach(term => {
      const docSet = this.inverseDocumentIndex.get(term);
      if (docSet) {
        docSet.delete(bookId);
        if (docSet.size === 0) {
          this.inverseDocumentIndex.delete(term);
          this.documentFrequency.delete(term);
        } else {
          this.documentFrequency.set(term, docSet.size);
        }
      }
    });

    // Remove from auxiliary indexes
    this.categoryIndex.get(index.metadata.category)?.delete(bookId);
    this.authorIndex.get(index.metadata.author)?.delete(bookId);
    
    const rating = Math.round(index.metadata.rating * 2) / 2;
    this.ratingIndex.get(rating)?.delete(bookId);

    // Remove from term frequency
    this.termFrequency.delete(bookId);
  }

  /**
   * Clear all indexes
   */
  private clearIndexes(): void {
    this.indexes.clear();
    this.termFrequency.clear();
    this.documentFrequency.clear();
    this.inverseDocumentIndex.clear();
    this.categoryIndex.clear();
    this.authorIndex.clear();
    this.ratingIndex.clear();
  }

  /**
   * Check if index should be rebuilt
   */
  private shouldRebuildIndex(): boolean {
    if (this.lastRebuild === 0) return true;
    
    const timeSinceRebuild = Date.now() - this.lastRebuild;
    return timeSinceRebuild > this.options.rebuildInterval;
  }

  /**
   * Cleanup empty indexes
   */
  private cleanupEmptyIndexes(): void {
    // Remove empty sets from auxiliary indexes
    for (const [key, docSet] of this.categoryIndex) {
      if (docSet.size === 0) {
        this.categoryIndex.delete(key);
      }
    }

    for (const [key, docSet] of this.authorIndex) {
      if (docSet.size === 0) {
        this.authorIndex.delete(key);
      }
    }

    for (const [key, docSet] of this.ratingIndex) {
      if (docSet.size === 0) {
        this.ratingIndex.delete(key);
      }
    }
  }

  /**
   * Optimize term frequency storage
   */
  private optimizeTermFrequency(): void {
    // Remove low-frequency terms to reduce index size
    const minFrequency = Math.max(1, Math.floor(this.indexes.size * 0.001));
    
    for (const [term, frequency] of this.documentFrequency) {
      if (frequency < minFrequency) {
        this.documentFrequency.delete(term);
        this.inverseDocumentIndex.delete(term);
      }
    }
  }

  /**
   * Compress indexes (placeholder for future implementation)
   */
  private async compressIndexes(): Promise<void> {
    // This could implement compression algorithms for the indexes
    // For now, it's a placeholder
    logger.debug('Index compression would be implemented here');
  }

  /**
   * Estimate memory usage of indexes
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    
    // Estimate size of main indexes
    size += this.indexes.size * 1000; // Rough estimate per index
    size += this.documentFrequency.size * 50; // Rough estimate per term
    size += this.inverseDocumentIndex.size * 100; // Rough estimate per inverted entry
    
    return Math.round(size / 1024); // Return in KB
  }

  /**
   * Load persisted indexes from storage
   */
  private loadPersistedIndexes(): void {
    try {
      // This would load from localStorage or IndexedDB
      // For now, it's a placeholder
      logger.debug('Index persistence would be implemented here');
    } catch (error) {
      logger.warn('Failed to load persisted indexes', error);
    }
  }

  /**
   * Persist indexes to storage
   */
  private async persistIndexes(): Promise<void> {
    try {
      // This would save to localStorage or IndexedDB
      // For now, it's a placeholder
      logger.debug('Index persistence would be implemented here');
    } catch (error) {
      logger.warn('Failed to persist indexes', error);
    }
  }
}

// Export singleton instance
export const searchIndexing = new SearchIndexingSystem();