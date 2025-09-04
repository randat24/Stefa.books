/**
 * Semantic Search Engine with Vector Embeddings and ML-like Content Understanding
 * Implements TF-IDF, cosine similarity, and semantic content matching
 */

interface SemanticSearchResult<T> {
  item: T;
  score: number;
  relevantFields: string[];
  semanticMatches: string[];
  explanation: string;
}

interface ContentVector {
  tfidf: Map<string, number>;
  magnitude: number;
  semanticKeywords: string[];
  concepts: string[];
}

class SemanticSearchEngine<T extends Record<string, any>> {
  private items: T[] = [];
  private contentVectors: ContentVector[] = [];
  private documentFrequency: Map<string, number> = new Map();
  private totalDocuments = 0;
  private stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'та', 'і', 'в', 'на', 'з',
    'для', 'про', 'це', 'який', 'яка', 'які', 'що', 'як', 'або'
  ]);

  // Semantic concept mappings for Ukrainian children's literature
  private conceptMappings: Map<string, string[]> = new Map([
    ['пригоди', ['подорож', 'квест', 'шукання', 'мандри', 'відкриття']],
    ['дружба', ['товариші', 'друзі', 'разом', 'команда', 'допомога']],
    ['казка', ['чарівність', 'магія', 'фантастика', 'чудеса', 'феї']],
    ['навчання', ['освіта', 'школа', 'знання', 'вчити', 'урок']],
    ['сім\'я', ['батьки', 'діти', 'родина', 'любов', 'дім', 'мама', 'тато']],
    ['природа', ['ліс', 'тварини', 'рослини', 'екологія', 'земля']],
    ['творчість', ['малювання', 'музика', 'мистецтво', 'створення']],
    ['емоції', ['радість', 'сум', 'злість', 'страх', 'щастя', 'любов']]
  ]);

  constructor(items: T[] = []) {
    this.setItems(items);
  }

  setItems(items: T[]): void {
    this.items = items;
    this.totalDocuments = items.length;
    this.buildSemanticIndex();
  }

  private buildSemanticIndex(): void {
    this.documentFrequency.clear();
    this.contentVectors = [];

    // First pass: calculate document frequency
    this.items.forEach(item => {
      const content = this.extractContent(item);
      const words = this.tokenizeAndClean(content);
      const uniqueWords = new Set(words);
      
      uniqueWords.forEach(word => {
        this.documentFrequency.set(word, (this.documentFrequency.get(word) || 0) + 1);
      });
    });

    // Second pass: create TF-IDF vectors
    this.items.forEach(item => {
      const vector = this.createContentVector(item);
      this.contentVectors.push(vector);
    });
  }

  private extractContent(item: T): string {
    const contentFields = ['title', 'author', 'category', 'description', 'short'];
    let content = '';
    
    contentFields.forEach(field => {
      if (item[field] && typeof item[field] === 'string') {
        content += ` ${item[field]}`;
      }
    });

    // Add keywords if available
    if (item.keywords && Array.isArray(item.keywords)) {
      content += ` ${item.keywords.join(' ')}`;
    }

    return content.trim();
  }

  private createContentVector(item: T): ContentVector {
    const content = this.extractContent(item);
    const words = this.tokenizeAndClean(content);
    const termFreq = new Map<string, number>();

    // Calculate term frequency
    words.forEach(word => {
      termFreq.set(word, (termFreq.get(word) || 0) + 1);
    });

    // Calculate TF-IDF
    const tfidf = new Map<string, number>();
    let magnitude = 0;

    termFreq.forEach((tf, term) => {
      const df = this.documentFrequency.get(term) || 1;
      const idf = Math.log(this.totalDocuments / df);
      const tfidfValue = tf * idf;
      tfidf.set(term, tfidfValue);
      magnitude += tfidfValue * tfidfValue;
    });

    magnitude = Math.sqrt(magnitude);

    // Extract semantic keywords and concepts
    const semanticKeywords = this.extractSemanticKeywords(words);
    const concepts = this.identifyConcepts(words);

    return {
      tfidf,
      magnitude,
      semanticKeywords,
      concepts
    };
  }

  private tokenizeAndClean(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\sа-яёіїєґ]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  private extractSemanticKeywords(words: string[]): string[] {
    // Use simple heuristics to identify important semantic keywords
    const keywordPatterns = [
      /дитин/,
      /книг/,
      /читан/,
      /вчит/,
      /граї/,
      /казк/,
      /пригод/,
      /дружб/,
      /родин/,
      /школ/
    ];

    return words.filter(word => 
      keywordPatterns.some(pattern => pattern.test(word))
    );
  }

  private identifyConcepts(words: string[]): string[] {
    const concepts: string[] = [];
    
    this.conceptMappings.forEach((keywords, concept) => {
      const hasConceptWords = keywords.some(keyword => 
        words.some(word => word.includes(keyword) || keyword.includes(word))
      );
      if (hasConceptWords) {
        concepts.push(concept);
      }
    });

    return concepts;
  }

  semanticSearch(query: string, options: {
    maxResults?: number;
    semanticWeight?: number;
    conceptWeight?: number;
    minRelevanceScore?: number;
  } = {}): SemanticSearchResult<T>[] {
    const {
      maxResults = 15,
      semanticWeight = 0.7,
      conceptWeight = 0.3,
      minRelevanceScore = 0.1
    } = options;

    if (!query.trim()) return [];

    // Create query vector
    const queryVector = this.createQueryVector(query);
    
    // Calculate semantic similarity with all items
    const results: SemanticSearchResult<T>[] = this.items.map((item, index) => {
      const itemVector = this.contentVectors[index];
      
      // Cosine similarity for TF-IDF vectors
      const cosineSimilarity = this.calculateCosineSimilarity(queryVector.tfidf, itemVector.tfidf, itemVector.magnitude);
      
      // Semantic concept matching
      const conceptSimilarity = this.calculateConceptSimilarity(queryVector.concepts, itemVector.concepts);
      
      // Combined score
      const score = (cosineSimilarity * semanticWeight) + (conceptSimilarity * conceptWeight);
      
      // Find relevant fields
      const relevantFields = this.findRelevantFields(query, item);
      const semanticMatches = this.findSemanticMatches(query, itemVector);
      
      return {
        item,
        score,
        relevantFields,
        semanticMatches,
        explanation: this.generateExplanation(cosineSimilarity, conceptSimilarity, relevantFields)
      };
    })
    .filter(result => result.score >= minRelevanceScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

    return results;
  }

  private createQueryVector(query: string): ContentVector {
    const words = this.tokenizeAndClean(query);
    const termFreq = new Map<string, number>();

    words.forEach(word => {
      termFreq.set(word, (termFreq.get(word) || 0) + 1);
    });

    const tfidf = new Map<string, number>();
    let magnitude = 0;

    termFreq.forEach((tf, term) => {
      const df = this.documentFrequency.get(term) || 1;
      const idf = Math.log(this.totalDocuments / df);
      const tfidfValue = tf * idf;
      tfidf.set(term, tfidfValue);
      magnitude += tfidfValue * tfidfValue;
    });

    magnitude = Math.sqrt(magnitude);

    return {
      tfidf,
      magnitude,
      semanticKeywords: this.extractSemanticKeywords(words),
      concepts: this.identifyConcepts(words)
    };
  }

  private calculateCosineSimilarity(queryTfidf: Map<string, number>, itemTfidf: Map<string, number>, itemMagnitude: number): number {
    if (itemMagnitude === 0) return 0;

    let dotProduct = 0;
    let queryMagnitude = 0;

    queryTfidf.forEach((queryWeight, term) => {
      const itemWeight = itemTfidf.get(term) || 0;
      dotProduct += queryWeight * itemWeight;
      queryMagnitude += queryWeight * queryWeight;
    });

    queryMagnitude = Math.sqrt(queryMagnitude);
    
    if (queryMagnitude === 0) return 0;
    
    return dotProduct / (queryMagnitude * itemMagnitude);
  }

  private calculateConceptSimilarity(queryConcepts: string[], itemConcepts: string[]): number {
    if (queryConcepts.length === 0 || itemConcepts.length === 0) return 0;

    const intersection = queryConcepts.filter(concept => itemConcepts.includes(concept));
    const union = [...new Set([...queryConcepts, ...itemConcepts])];

    return intersection.length / union.length; // Jaccard similarity
  }

  private findRelevantFields(query: string, item: T): string[] {
    const queryWords = this.tokenizeAndClean(query);
    const relevantFields: string[] = [];
    const searchableFields = ['title', 'author', 'category', 'description'];

    searchableFields.forEach(field => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        const fieldWords = this.tokenizeAndClean(fieldValue);
        const hasMatch = queryWords.some(queryWord => 
          fieldWords.some(fieldWord => 
            fieldWord.includes(queryWord) || queryWord.includes(fieldWord)
          )
        );
        if (hasMatch) {
          relevantFields.push(field);
        }
      }
    });

    return relevantFields;
  }

  private findSemanticMatches(query: string, itemVector: ContentVector): string[] {
    const queryWords = this.tokenizeAndClean(query);
    const semanticMatches: string[] = [];

    // Find semantic keyword matches
    itemVector.semanticKeywords.forEach(keyword => {
      queryWords.forEach(queryWord => {
        if (keyword.includes(queryWord) || queryWord.includes(keyword)) {
          semanticMatches.push(keyword);
        }
      });
    });

    // Add concept matches
    itemVector.concepts.forEach(concept => {
      const conceptWords = this.conceptMappings.get(concept) || [];
      const hasConceptMatch = queryWords.some(queryWord => 
        conceptWords.some(conceptWord => 
          conceptWord.includes(queryWord) || queryWord.includes(conceptWord)
        )
      );
      if (hasConceptMatch) {
        semanticMatches.push(concept);
      }
    });

    return [...new Set(semanticMatches)];
  }

  private generateExplanation(cosineSimilarity: number, conceptSimilarity: number, relevantFields: string[]): string {
    const explanations: string[] = [];

    if (cosineSimilarity > 0.5) {
      explanations.push("висока текстова схожість");
    } else if (cosineSimilarity > 0.2) {
      explanations.push("помірна текстова схожість");
    }

    if (conceptSimilarity > 0.3) {
      explanations.push("схожі тематичні концепти");
    }

    if (relevantFields.length > 0) {
      explanations.push(`збіги в полях: ${relevantFields.join(', ')}`);
    }

    return explanations.length > 0 ? explanations.join(', ') : "загальна семантична схожість";
  }

  // Advanced search with query expansion
  expandedSemanticSearch(query: string, options: any = {}): SemanticSearchResult<T>[] {
    const expandedQuery = this.expandQuery(query);
    return this.semanticSearch(expandedQuery, options);
  }

  private expandQuery(query: string): string {
    const words = this.tokenizeAndClean(query);
    const expandedTerms = new Set(words);

    // Add conceptually related terms
    words.forEach(word => {
      this.conceptMappings.forEach((relatedWords, _concept) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        if (relatedWords.some(related => related.includes(word) || word.includes(related))) {
          relatedWords.forEach(related => expandedTerms.add(related));
        }
      });
    });

    return Array.from(expandedTerms).join(' ');
  }

  // Get content-based recommendations
  getRecommendations(item: T, maxRecommendations = 5): SemanticSearchResult<T>[] {
    const itemIndex = this.items.indexOf(item);
    if (itemIndex === -1) return [];

    const targetVector = this.contentVectors[itemIndex];
    
    const recommendations = this.items
      .map((candidateItem, index) => {
        if (index === itemIndex) return null; // Skip same item
        
        const candidateVector = this.contentVectors[index];
        const similarity = this.calculateCosineSimilarity(
          targetVector.tfidf, 
          candidateVector.tfidf, 
          candidateVector.magnitude
        );

        const conceptSimilarity = this.calculateConceptSimilarity(
          targetVector.concepts,
          candidateVector.concepts
        );

        const score = (similarity * 0.7) + (conceptSimilarity * 0.3);

        return {
          item: candidateItem,
          score,
          relevantFields: [] as string[],
          semanticMatches: candidateVector.concepts,
          explanation: `схожий контент (${Math.round(score * 100)}% схожості)`
        };
      })
      .filter((rec): rec is SemanticSearchResult<T> => rec !== null && rec.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);

    return recommendations;
  }
}

export { SemanticSearchEngine, type SemanticSearchResult };