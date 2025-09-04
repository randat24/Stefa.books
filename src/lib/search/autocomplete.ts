/**
 * ML-Powered Autocomplete System with Predictive Algorithms
 * Implements Trie, N-gram models, and frequency-based ranking
 */

interface AutocompleteResult {
  suggestion: string;
  score: number;
  type: 'exact' | 'prefix' | 'correction' | 'semantic' | 'popular';
  metadata?: {
    frequency?: number;
    category?: string;
    author?: string;
    isBookTitle?: boolean;
  };
}

interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  frequency: number;
  metadata: Set<string>;
}

class MLAutocompleteEngine {
  private trie: TrieNode;
  private ngramModel: Map<string, Map<string, number>>;
  private frequencyModel: Map<string, number>;
  private contextModel: Map<string, Set<string>>;
  private popularQueries: Map<string, number>;
  private recentQueries: string[] = [];
  private maxRecentQueries = 100;

  constructor() {
    this.trie = this.createTrieNode();
    this.ngramModel = new Map();
    this.frequencyModel = new Map();
    this.contextModel = new Map();
    this.popularQueries = new Map();
  }

  // Initialize with data source
  initialize(items: any[]): void {
    this.buildTrie(items);
    this.buildNgramModel(items);
    this.buildContextModel(items);
    this.loadPopularQueries();
  }

  // Add a single document to the engine
  addDocument(text: string, _documentId: string): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    const words = this.tokenize(text);
    words.forEach(word => {
      this.insertIntoTrie(word, 'document');
    });
    this.addToNgramModel(words);
  }

  // Simple suggestion method for compatibility
  getSuggestions(query: string, options: { maxSuggestions?: number } = {}): string[] {
    const results = this.getAutocompleteSuggestions(query, {
      maxSuggestions: options.maxSuggestions || 5,
      includeCorrections: true,
      includeSemanticSuggestions: true,
      contextBoost: true
    });
    
    return results.map(result => result.suggestion);
  }

  // Track search for analytics
  trackSearch(query: string, _hasResults: boolean): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    this.recordQuery(query);
    // Additional tracking logic could be added here
  }

  private createTrieNode(): TrieNode {
    return {
      children: new Map(),
      isEndOfWord: false,
      frequency: 0,
      metadata: new Set()
    };
  }

  private buildTrie(items: any[]): void {
    items.forEach(item => {
      // Index titles
      if (item.title) {
        this.insertIntoTrie(item.title, 'title', item.author, item.category);
        
        // Also index individual words from title
        const words = this.tokenize(item.title);
        words.forEach(word => {
          this.insertIntoTrie(word, 'word', item.author, item.category);
        });
      }

      // Index authors
      if (item.author) {
        this.insertIntoTrie(item.author, 'author', item.author, item.category);
        
        const authorWords = this.tokenize(item.author);
        authorWords.forEach(word => {
          this.insertIntoTrie(word, 'author_word', item.author, item.category);
        });
      }

      // Index categories
      if (item.category) {
        this.insertIntoTrie(item.category, 'category', item.author, item.category);
      }

      // Index keywords if available
      if (item.keywords && Array.isArray(item.keywords)) {
        item.keywords.forEach((keyword: string) => {
          this.insertIntoTrie(keyword, 'keyword', item.author, item.category);
        });
      }
    });
  }

  private insertIntoTrie(word: string, type: string, author?: string, category?: string): void {
    const cleanWord = word.toLowerCase().trim();
    if (!cleanWord) return;

    let current = this.trie;
    
    for (const char of cleanWord) {
      if (!current.children.has(char)) {
        current.children.set(char, this.createTrieNode());
      }
      current = current.children.get(char)!;
    }
    
    current.isEndOfWord = true;
    current.frequency += 1;
    current.metadata.add(JSON.stringify({ type, author, category }));
    
    // Update frequency model
    this.frequencyModel.set(cleanWord, (this.frequencyModel.get(cleanWord) || 0) + 1);
  }

  private buildNgramModel(items: any[]): void {
    items.forEach(item => {
      const texts = [item.title, item.author, item.description].filter(Boolean);
      texts.forEach(text => {
        if (typeof text === 'string') {
          const words = this.tokenize(text);
          this.addToNgramModel(words);
        }
      });
    });
  }

  private addToNgramModel(words: string[]): void {
    // Build bigram and trigram models
    for (let i = 0; i < words.length - 1; i++) {
      const current = words[i];
      const next = words[i + 1];
      
      if (!this.ngramModel.has(current)) {
        this.ngramModel.set(current, new Map());
      }
      
      const nextMap = this.ngramModel.get(current)!;
      nextMap.set(next, (nextMap.get(next) || 0) + 1);
    }
  }

  private buildContextModel(items: any[]): void {
    // Build contextual relationships
    items.forEach(item => {
      const contexts = [item.category, item.author].filter(Boolean);
      const words = this.tokenize(`${item.title} ${item.description || ''}`);
      
      contexts.forEach(context => {
        if (!this.contextModel.has(context)) {
          this.contextModel.set(context, new Set());
        }
        words.forEach(word => {
          this.contextModel.get(context)!.add(word);
        });
      });
    });
  }

  private loadPopularQueries(): void {
    // Simulate popular queries (in real app, load from analytics)
    const mockPopularQueries = [
      'дитячі книги', 'казки', 'пригоди', 'дружба', 'школа',
      'тварини', 'сім\'я', 'фантастика', 'навчання', 'творчість'
    ];

    mockPopularQueries.forEach((query, index) => {
      this.popularQueries.set(query, 100 - index * 5);
    });
  }

  // Main autocomplete function
  getAutocompleteSuggestions(input: string, options: {
    maxSuggestions?: number;
    includeCorrections?: boolean;
    includeSemanticSuggestions?: boolean;
    contextBoost?: boolean;
  } = {}): AutocompleteResult[] {
    const {
      maxSuggestions = 8,
      includeCorrections = true,
      includeSemanticSuggestions = true,
      contextBoost = true
    } = options;

    if (!input.trim() || input.length < 1) {
      return this.getPopularSuggestions(maxSuggestions);
    }

    const cleanInput = input.toLowerCase().trim();
    const suggestions = new Map<string, AutocompleteResult>();

    // 1. Exact and prefix matches from Trie
    const trieResults = this.getTrieSuggestions(cleanInput, maxSuggestions * 2);
    trieResults.forEach(result => {
      suggestions.set(result.suggestion, result);
    });

    // 2. N-gram based predictions
    if (includeSemanticSuggestions) {
      const ngramResults = this.getNgramSuggestions(cleanInput, maxSuggestions);
      ngramResults.forEach(result => {
        if (!suggestions.has(result.suggestion)) {
          suggestions.set(result.suggestion, result);
        }
      });
    }

    // 3. Typo corrections
    if (includeCorrections && cleanInput.length > 2) {
      const corrections = this.getTypoCorrections(cleanInput, 3);
      corrections.forEach(result => {
        if (!suggestions.has(result.suggestion)) {
          suggestions.set(result.suggestion, result);
        }
      });
    }

    // 4. Context-based suggestions
    if (contextBoost) {
      this.boostContextualSuggestions(suggestions, cleanInput);
    }

    // 5. Recent query boosting
    this.boostRecentQueries(suggestions);

    // Sort by score and return top results
    const sortedSuggestions = Array.from(suggestions.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);

    // Track this query for learning
    this.recordQuery(cleanInput);

    return sortedSuggestions;
  }

  private getTrieSuggestions(input: string, maxResults: number): AutocompleteResult[] {
    const results: AutocompleteResult[] = [];
    const prefixNode = this.findPrefixNode(input);
    
    if (!prefixNode) return results;

    // DFS to find all completions
    this.dfsCollectSuggestions(prefixNode, input, results, maxResults);

    return results.sort((a, b) => b.score - a.score);
  }

  private findPrefixNode(prefix: string): TrieNode | null {
    let current = this.trie;
    
    for (const char of prefix) {
      if (!current.children.has(char)) {
        return null;
      }
      current = current.children.get(char)!;
    }
    
    return current;
  }

  private dfsCollectSuggestions(
    node: TrieNode, 
    currentWord: string, 
    results: AutocompleteResult[], 
    maxResults: number,
    depth = 0
  ): void {
    if (results.length >= maxResults || depth > 20) return;

    if (node.isEndOfWord && currentWord.length > 1) {
      const frequency = this.frequencyModel.get(currentWord) || 1;
      const isExact = currentWord === currentWord;
      
      results.push({
        suggestion: currentWord,
        score: this.calculateTrieScore(frequency, isExact, depth),
        type: isExact ? 'exact' : 'prefix',
        metadata: {
          frequency,
          isBookTitle: this.isLikelyBookTitle(node.metadata)
        }
      });
    }

    // Continue DFS
    node.children.forEach((childNode, char) => {
      this.dfsCollectSuggestions(
        childNode, 
        currentWord + char, 
        results, 
        maxResults, 
        depth + 1
      );
    });
  }

  private calculateTrieScore(frequency: number, isExact: boolean, depth: number): number {
    let score = Math.log(frequency + 1) * 10;
    
    if (isExact) score *= 2;
    
    // Penalize very long completions
    if (depth > 10) score *= 0.5;
    
    return score;
  }

  private isLikelyBookTitle(metadata: Set<string>): boolean {
    for (const metaString of metadata) {
      try {
        const meta = JSON.parse(metaString);
        if (meta.type === 'title') return true;
      } catch {
        // ignore
      }
    }
    return false;
  }

  private getNgramSuggestions(input: string, maxResults: number): AutocompleteResult[] {
    const words = this.tokenize(input);
    if (words.length === 0) return [];

    const lastWord = words[words.length - 1];
    const predictions: AutocompleteResult[] = [];

    // Get next word predictions based on last word
    const nextWordMap = this.ngramModel.get(lastWord);
    if (nextWordMap) {
      const sortedPredictions = Array.from(nextWordMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxResults);

      sortedPredictions.forEach(([nextWord, frequency]) => {
        const suggestion = `${input} ${nextWord}`;
        predictions.push({
          suggestion,
          score: Math.log(frequency + 1) * 5,
          type: 'semantic',
          metadata: { frequency }
        });
      });
    }

    return predictions;
  }

  private getTypoCorrections(input: string, maxDistance: number): AutocompleteResult[] {
    const corrections: AutocompleteResult[] = [];
    const inputLength = input.length;

    // Only check words of similar length
    this.frequencyModel.forEach((frequency, word) => {
      if (Math.abs(word.length - inputLength) <= maxDistance) {
        const distance = this.levenshteinDistance(input, word);
        
        if (distance > 0 && distance <= maxDistance) {
          const score = (maxDistance - distance + 1) * Math.log(frequency + 1) * 3;
          corrections.push({
            suggestion: word,
            score,
            type: 'correction',
            metadata: { frequency }
          });
        }
      }
    });

    return corrections.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[b.length][a.length];
  }

  private boostContextualSuggestions(suggestions: Map<string, AutocompleteResult>, input: string): void {
    const inputWords = this.tokenize(input);
    
    suggestions.forEach(suggestion => {
      // Boost based on contextual relevance
      this.contextModel.forEach((contextWords, context) => {
        const hasContextWords = inputWords.some(word => contextWords.has(word));
        if (hasContextWords && suggestion.suggestion.includes(context)) {
          suggestion.score *= 1.3;
        }
      });
    });
  }

  private boostRecentQueries(suggestions: Map<string, AutocompleteResult>): void {
    suggestions.forEach(suggestion => {
      const recentBoost = this.recentQueries.includes(suggestion.suggestion) ? 1.2 : 1;
      const popularBoost = this.popularQueries.get(suggestion.suggestion) ? 1.5 : 1;
      
      suggestion.score *= recentBoost * popularBoost;
    });
  }

  private getPopularSuggestions(maxResults: number): AutocompleteResult[] {
    return Array.from(this.popularQueries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults)
      .map(([query, popularity]) => ({
        suggestion: query,
        score: popularity,
        type: 'popular' as const,
        metadata: { frequency: popularity }
      }));
  }

  private recordQuery(query: string): void {
    // Add to recent queries
    this.recentQueries.unshift(query);
    if (this.recentQueries.length > this.maxRecentQueries) {
      this.recentQueries.pop();
    }

    // Update popular queries (simulate user behavior learning)
    const currentCount = this.popularQueries.get(query) || 0;
    this.popularQueries.set(query, currentCount + 1);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\sа-яёіїєґ]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  // Advanced features
  
  // Get query suggestions based on partial typing
  getInstantSuggestions(partialInput: string): string[] {
    if (partialInput.length < 2) return [];
    
    const suggestions = this.getAutocompleteSuggestions(partialInput, { 
      maxSuggestions: 5,
      includeCorrections: false 
    });
    
    return suggestions.map(s => s.suggestion);
  }

  // Get contextual suggestions based on current search context
  getContextualSuggestions(currentQuery: string, context: { 
    category?: string; 
    author?: string; 
    recentSearches?: string[] 
  }): AutocompleteResult[] {
    const suggestions = this.getAutocompleteSuggestions(currentQuery, {
      maxSuggestions: 10,
      contextBoost: true
    });

    // Further boost based on provided context
    if (context.category) {
      suggestions.forEach(suggestion => {
        if (suggestion.suggestion.includes(context.category!)) {
          suggestion.score *= 1.4;
        }
      });
    }

    if (context.recentSearches) {
      context.recentSearches.forEach(recentSearch => {
        suggestions.forEach(suggestion => {
          const similarity = this.calculateStringSimilarity(suggestion.suggestion, recentSearch);
          if (similarity > 0.5) {
            suggestion.score *= (1 + similarity * 0.3);
          }
        });
      });
    }

    return suggestions.sort((a, b) => b.score - a.score);
  }

  private calculateStringSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Machine learning simulation: adapt to user behavior
  adaptToUserBehavior(selectedSuggestion: string, originalQuery: string, userAction: 'selected' | 'rejected'): void {
    if (userAction === 'selected') {
      // Boost this suggestion's score for similar future queries
      const currentScore = this.popularQueries.get(selectedSuggestion) || 0;
      this.popularQueries.set(selectedSuggestion, currentScore + 5);
      
      // Learn from the user's choice
      this.recordQuery(selectedSuggestion);
    } else if (userAction === 'rejected') {
      // Slightly reduce the score
      const currentScore = this.popularQueries.get(selectedSuggestion) || 0;
      this.popularQueries.set(selectedSuggestion, Math.max(0, currentScore - 1));
    }
  }

  // Export learning data (for persistence)
  exportLearningData(): any {
    return {
      popularQueries: Array.from(this.popularQueries.entries()),
      recentQueries: this.recentQueries,
      frequencyModel: Array.from(this.frequencyModel.entries()),
    };
  }

  // Import learning data (from persistence)
  importLearningData(data: any): void {
    if (data.popularQueries) {
      this.popularQueries = new Map(data.popularQueries);
    }
    if (data.recentQueries) {
      this.recentQueries = data.recentQueries;
    }
    if (data.frequencyModel) {
      this.frequencyModel = new Map(data.frequencyModel);
    }
  }
}

export { MLAutocompleteEngine, type AutocompleteResult };