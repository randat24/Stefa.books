/**
 * Advanced Fuzzy Search Engine with Typo Correction
 * Implements Levenshtein distance, phonetic matching, and ML-like scoring
 */

interface SearchableItem {
  id: string;
  title: string;
  author: string;
  category: string;
  description?: string | null;
  keywords?: string[];
  [key: string]: any;
}

interface SearchResult<T = SearchableItem> {
  item: T;
  score: number;
  matches: SearchMatch[];
  correctedQuery?: string;
}

interface SearchMatch {
  field: string;
  value: string;
  indices: [number, number][];
  type: 'exact' | 'fuzzy' | 'phonetic' | 'semantic';
}

class FuzzySearchEngine<T extends SearchableItem> {
  private items: T[] = [];
  private invertedIndex: Map<string, Set<number>> = new Map();
  private phonetixIndex: Map<string, Set<number>> = new Map();
  private ngramIndex: Map<string, Set<number>> = new Map();
  
  // Weights for different match types
  private readonly WEIGHTS = {
    exact: 1.0,
    fuzzy: 0.8,
    phonetic: 0.6,
    semantic: 0.7,
    title: 2.0,
    author: 1.5,
    category: 1.2,
    description: 0.8,
    keywords: 1.3
  };

  constructor(items: T[] = []) {
    this.setItems(items);
  }

  setItems(items: T[]): void {
    this.items = items;
    this.buildIndexes();
  }

  private buildIndexes(): void {
    this.invertedIndex.clear();
    this.phonetixIndex.clear();
    this.ngramIndex.clear();

    this.items.forEach((item, index) => {
      // Index all searchable fields
      const searchableFields = ['title', 'author', 'category', 'description'];
      
      searchableFields.forEach(field => {
        const value = item[field];
        if (typeof value === 'string') {
          this.indexField(value, index, field);
        }
      });

      // Index keywords array
      if (item.keywords && Array.isArray(item.keywords)) {
        item.keywords.forEach(keyword => {
          this.indexField(keyword, index, 'keywords');
        });
      }
    });
  }

  private indexField(text: string, itemIndex: number, _field: string): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    const words = this.tokenize(text);
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase();
      
      // Inverted index for exact matches
      if (!this.invertedIndex.has(cleanWord)) {
        this.invertedIndex.set(cleanWord, new Set());
      }
      this.invertedIndex.get(cleanWord)!.add(itemIndex);

      // Phonetic index (simplified Soundex)
      const phonetic = this.generateSoundex(cleanWord);
      if (!this.phonetixIndex.has(phonetic)) {
        this.phonetixIndex.set(phonetic, new Set());
      }
      this.phonetixIndex.get(phonetic)!.add(itemIndex);

      // N-gram index for partial matching
      const ngrams = this.generateNgrams(cleanWord, 3);
      ngrams.forEach(ngram => {
        if (!this.ngramIndex.has(ngram)) {
          this.ngramIndex.set(ngram, new Set());
        }
        this.ngramIndex.get(ngram)!.add(itemIndex);
      });
    });
  }

  search(query: string, options: {
    maxResults?: number;
    threshold?: number;
    fuzzyTolerance?: number;
    enableTypoCorrection?: boolean;
  } = {}): SearchResult<T>[] {
    const {
      maxResults = 20,
      threshold = 0.1,
      fuzzyTolerance = 2,
      enableTypoCorrection = true
    } = options;

    if (!query.trim()) return [];

    const queryTerms = this.tokenize(query.toLowerCase());
    const candidateScores = new Map<number, number>();
    const matches = new Map<number, SearchMatch[]>();

    // Corrected query for typos
    const correctedQuery = enableTypoCorrection ? this.correctTypos(query) : query;

    queryTerms.forEach(term => {
      // Exact matches
      const exactMatches = this.invertedIndex.get(term) || new Set();
      exactMatches.forEach(itemIndex => {
        this.addScore(candidateScores, itemIndex, this.WEIGHTS.exact);
        this.addMatch(matches, itemIndex, {
          field: this.findMatchingField(term, itemIndex),
          value: term,
          indices: [[0, term.length]],
          type: 'exact'
        });
      });

      // Fuzzy matches
      this.findFuzzyMatches(term, fuzzyTolerance).forEach(({ itemIndex, distance }) => {
        const fuzzyScore = this.WEIGHTS.fuzzy * (1 - distance / Math.max(term.length, 5));
        this.addScore(candidateScores, itemIndex, fuzzyScore);
        this.addMatch(matches, itemIndex, {
          field: this.findMatchingField(term, itemIndex),
          value: term,
          indices: [[0, term.length]],
          type: 'fuzzy'
        });
      });

      // Phonetic matches
      const soundex = this.generateSoundex(term);
      const phoneticMatches = this.phonetixIndex.get(soundex) || new Set();
      phoneticMatches.forEach(itemIndex => {
        if (!exactMatches.has(itemIndex)) {
          this.addScore(candidateScores, itemIndex, this.WEIGHTS.phonetic);
          this.addMatch(matches, itemIndex, {
            field: this.findMatchingField(term, itemIndex),
            value: term,
            indices: [[0, term.length]],
            type: 'phonetic'
          });
        }
      });
    });

    // Convert to results and sort by score
    const results: SearchResult<T>[] = Array.from(candidateScores.entries())
      .filter(([, score]) => score >= threshold)
      .map(([itemIndex, score]) => ({
        item: this.items[itemIndex],
        score,
        matches: matches.get(itemIndex) || [],
        correctedQuery: correctedQuery !== query ? correctedQuery : undefined
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return results;
  }

  private findFuzzyMatches(term: string, tolerance: number): Array<{ itemIndex: number; distance: number }> {
    const matches: Array<{ itemIndex: number; distance: number }> = [];
    
    // Use n-gram index to find potential candidates
    const ngrams = this.generateNgrams(term, 3);
    const candidates = new Set<number>();
    
    ngrams.forEach(ngram => {
      const ngramMatches = this.ngramIndex.get(ngram);
      if (ngramMatches) {
        ngramMatches.forEach(index => candidates.add(index));
      }
    });

    // Calculate Levenshtein distance for candidates
    candidates.forEach(itemIndex => {
      const item = this.items[itemIndex];
      const searchableText = `${item.title} ${item.author} ${item.category}`.toLowerCase();
      const words = this.tokenize(searchableText);
      
      words.forEach(word => {
        const distance = this.levenshteinDistance(term, word);
        if (distance <= tolerance) {
          matches.push({ itemIndex, distance });
        }
      });
    });

    return matches;
  }

  private correctTypos(query: string): string {
    const words = this.tokenize(query);
    const correctedWords = words.map(word => {
      const lowerWord = word.toLowerCase();
      
      // Check if word exists in our index
      if (this.invertedIndex.has(lowerWord)) {
        return word;
      }

      // Find closest match with Levenshtein distance
      let bestMatch = word;
      let bestDistance = Infinity;

      for (const indexedWord of this.invertedIndex.keys()) {
        if (Math.abs(indexedWord.length - lowerWord.length) > 2) continue;
        
        const distance = this.levenshteinDistance(lowerWord, indexedWord);
        if (distance < bestDistance && distance <= 2) {
          bestDistance = distance;
          bestMatch = indexedWord;
        }
      }

      return bestDistance < Infinity ? bestMatch : word;
    });

    return correctedWords.join(' ');
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }

  private generateSoundex(word: string): string {
    if (!word) return '';
    
    const soundexMap: { [key: string]: string } = {
      'b': '1', 'f': '1', 'p': '1', 'v': '1',
      'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
      'd': '3', 't': '3',
      'l': '4',
      'm': '5', 'n': '5',
      'r': '6'
    };

    const firstLetter = word[0].toUpperCase();
    let soundex = firstLetter;
    
    for (let i = 1; i < word.length && soundex.length < 4; i++) {
      const char = word[i].toLowerCase();
      const code = soundexMap[char];
      
      if (code && code !== soundex[soundex.length - 1]) {
        soundex += code;
      }
    }

    return soundex.padEnd(4, '0').substring(0, 4);
  }

  private generateNgrams(text: string, n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.push(text.substring(i, i + n));
    }
    return ngrams;
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\sа-яёіїє]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private addScore(scores: Map<number, number>, itemIndex: number, score: number): void {
    scores.set(itemIndex, (scores.get(itemIndex) || 0) + score);
  }

  private addMatch(matches: Map<number, SearchMatch[]>, itemIndex: number, match: SearchMatch): void {
    if (!matches.has(itemIndex)) {
      matches.set(itemIndex, []);
    }
    matches.get(itemIndex)!.push(match);
  }

  private findMatchingField(term: string, itemIndex: number): string {
    const item = this.items[itemIndex];
    const searchableFields = ['title', 'author', 'category', 'description'];
    
    for (const field of searchableFields) {
      const value = item[field];
      if (typeof value === 'string' && value.toLowerCase().includes(term)) {
        return field;
      }
    }
    
    return 'title'; // fallback
  }

  // Get search suggestions based on partial input
  getSuggestions(partialQuery: string, maxSuggestions = 5): string[] {
    if (partialQuery.length < 2) return [];

    const suggestions = new Set<string>();
    const lowerQuery = partialQuery.toLowerCase();

    // Find words that start with the query
    for (const word of this.invertedIndex.keys()) {
      if (word.startsWith(lowerQuery) && suggestions.size < maxSuggestions * 2) {
        suggestions.add(word);
      }
    }

    // Find words that contain the query
    if (suggestions.size < maxSuggestions) {
      for (const word of this.invertedIndex.keys()) {
        if (word.includes(lowerQuery) && !word.startsWith(lowerQuery) && suggestions.size < maxSuggestions * 2) {
          suggestions.add(word);
        }
      }
    }

    return Array.from(suggestions).slice(0, maxSuggestions);
  }
}

export { FuzzySearchEngine, type SearchResult, type SearchMatch, type SearchableItem };