import { callClaudeOpus41, generateWithThinking, CLAUDE_MODELS } from '@/lib/claude';
import type { Book } from '@/lib/supabase';

export interface BookAnalysisResult {
  category: string;
  ageGroup: string;
  keywords: string[];
  shortDescription: string;
  recommendedFor: string[];
  rating?: number;
  thinking?: string;
}

export interface BookContentImprovement {
  improvedTitle?: string;
  improvedDescription: string;
  seoKeywords: string[];
  metaDescription: string;
  hashtags: string[];
  thinking?: string;
}

export interface BookRecommendation {
  bookId: string;
  title: string;
  reason: string;
  matchScore: number;
  ageAppropriate: boolean;
}

export async function analyzeBookContent(book: Book): Promise<BookAnalysisResult> {
  const prompt = `
Проанализируй эту детскую книгу:

Название: ${book.title}
Автор: ${book.author}
Описание: ${book.description || 'Описание отсутствует'}
Текущая категория: ${book.category}
Цена: ${book.price_uah} грн
Возрастная группа: ${book.age_group || 'Не указана'}

Определи:
1. Наиболее подходящую категорию
2. Возрастную группу (например: "0-3", "4-6", "7-10", "11-14", "15+")  
3. Ключевые слова для поиска (5-8 слов)
4. Краткое описание (50-80 слов)
5. Для кого рекомендуется книга

Формат ответа JSON:
{
  "category": "категория",
  "ageGroup": "возрастная группа",
  "keywords": ["слово1", "слово2"],
  "shortDescription": "краткое описание",
  "recommendedFor": ["любители фантастики", "дети с активным воображением"],
  "rating": 4.5
}
  `.trim();

  const systemPrompt = `
Ты експерт по дитячій літературі та бібліотекар дитячої бібліотеки Stefa.Books.
Твоя задача - професійно аналізувати дитячі книги для каталогізації та рекомендацій.
Відповідай точним JSON без додаткових коментарів.
  `.trim();

  const response = await generateWithThinking(prompt, systemPrompt, 4000);

  try {
    const analysis = JSON.parse(response.content.replace(/```json\n?|\n?```/g, ''));
    return {
      ...analysis,
      thinking: response.thinking,
    };
  } catch (error) {
    console.error('Error parsing book analysis:', error);
    // Fallback analysis
    return {
      category: book.category || 'Загальна література',
      ageGroup: book.age_group || '4-10',
      keywords: [book.title.split(' ')[0], book.author.split(' ')[0], 'діти', 'книга'],
      shortDescription: book.description?.slice(0, 80) + '...' || 'Цікава дитяча книга.',
      recommendedFor: ['діти', 'батьки'],
      thinking: response.thinking,
    };
  }
}

export async function improveBookContent(book: Book): Promise<BookContentImprovement> {
  const prompt = `
Улучши контент для этой детской книги в каталоге:

Название: ${book.title}
Автор: ${book.author}
Текущее описание: ${book.description || 'Описание отсутствует'}
Категория: ${book.category}
Возраст: ${book.age_group || 'Не указан'}

Создай:
1. Улучшенное описание (100-150 слов), привлекательное для детей и родителей
2. SEO ключевые слова (8-12 слов)
3. Мета-описание для Google (150-160 символов)
4. Хештеги для соцсетей (5-8 штук)
5. При необходимости предложи улучшенное название

Пиши на украинском языке. Делай контент привлекательным и информативным.

Формат ответа JSON:
{
  "improvedTitle": "улучшенное название или null",
  "improvedDescription": "улучшенное описание",
  "seoKeywords": ["ключевое слово"],
  "metaDescription": "мета описание",
  "hashtags": ["#хештег"]
}
  `.trim();

  const systemPrompt = `
Ти експерт по контент-маркетингу дитячих книг та SEO оптимізації.
Створюй привабливий контент українською мовою для дитячої аудиторії.
Враховуй психологію дітей та батьків при написанні.
  `.trim();

  const response = await generateWithThinking(prompt, systemPrompt, 6000);

  try {
    const improvement = JSON.parse(response.content.replace(/```json\n?|\n?```/g, ''));
    return {
      ...improvement,
      thinking: response.thinking,
    };
  } catch (error) {
    console.error('Error parsing content improvement:', error);
    return {
      improvedDescription: book.description || 'Чудова дитяча книга для розвитку уяви та пізнання світу.',
      seoKeywords: ['дитяча книга', 'література', book.author, 'читання'],
      metaDescription: `${book.title} - ${book.author}. Цікава дитяча книга у бібліотеці Stefa.Books.`,
      hashtags: ['#дитячікниги', '#читання', '#література', '#stefabooks'],
      thinking: response.thinking,
    };
  }
}

export async function generatePersonalizedRecommendations(
  userPreferences: {
    childAge: number;
    interests: string[];
    favoriteGenres: string[];
    readingLevel: 'beginner' | 'intermediate' | 'advanced';
    previousBooks?: string[];
  },
  availableBooks: Book[],
  maxRecommendations = 5
): Promise<BookRecommendation[]> {
  const booksData = availableBooks.slice(0, 50).map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    ageGroup: book.age_group,
    description: book.description?.slice(0, 200),
    available: book.available,
  }));

  const prompt = `
Создай персонализованные рекомендации книг для ребенка:

Профиль ребенка:
- Возраст: ${userPreferences.childAge} лет
- Интересы: ${userPreferences.interests.join(', ')}
- Любимые жанры: ${userPreferences.favoriteGenres.join(', ')}
- Уровень чтения: ${userPreferences.readingLevel}
- Прочитанные книги: ${userPreferences.previousBooks?.join(', ') || 'Не указаны'}

Доступные книги:
${JSON.stringify(booksData, null, 2)}

Выбери ${maxRecommendations} лучших книг и объясни почему они подходят.

Формат ответа JSON:
{
  "recommendations": [
    {
      "bookId": "id книги",
      "title": "название",
      "reason": "почему подходит (30-50 слов)",
      "matchScore": 0.95,
      "ageAppropriate": true
    }
  ]
}
  `.trim();

  const systemPrompt = `
Ти експерт-бібліотекар з 15-річним досвідом роботи з дітьми.
Розумієш дитячу психологію та підбираєш книги з урахуванням віку, інтересів та рівня розвитку.
Рекомендації мають бути точними та обґрунтованими.
  `.trim();

  const response = await generateWithThinking(prompt, systemPrompt, 8000);

  try {
    const result = JSON.parse(response.content.replace(/```json\n?|\n?```/g, ''));
    return result.recommendations || [];
  } catch (error) {
    console.error('Error parsing recommendations:', error);
    return [];
  }
}

export async function categorizeBookAutomatically(
  bookData: {
    title: string;
    author: string;
    description?: string;
    isbn?: string;
  },
  availableCategories: string[]
): Promise<{ category: string; confidence: number; reasoning: string }> {
  const prompt = `
Определи категорию для этой книги:

Название: ${bookData.title}
Автор: ${bookData.author}
Описание: ${bookData.description || 'Отсутствует'}
ISBN: ${bookData.isbn || 'Не указан'}

Доступные категории:
${availableCategories.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}

Выбери наиболее подходящую категорию и объясни выбор.

Формат ответа JSON:
{
  "category": "выбранная категория",
  "confidence": 0.85,
  "reasoning": "объяснение выбора"
}
  `.trim();

  const systemPrompt = `
Ти експерт з каталогізації дитячих книг.
Аналізуй назву, автора та опис для точної категоризації.
Враховуй жанр, вікову групу та тематику книги.
  `.trim();

  const response = await callClaudeOpus41({
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
    thinking: true,
  });

  try {
    const result = JSON.parse(response.content.replace(/```json\n?|\n?```/g, ''));
    return result;
  } catch (error) {
    console.error('Error parsing categorization:', error);
    return {
      category: availableCategories[0] || 'Загальна література',
      confidence: 0.3,
      reasoning: 'Автоматична категоризація не вдалась, обрано категорію за замовчуванням.',
    };
  }
}

export const bookAnalysis = {
  analyzeBookContent,
  improveBookContent, 
  generatePersonalizedRecommendations,
  categorizeBookAutomatically,
};