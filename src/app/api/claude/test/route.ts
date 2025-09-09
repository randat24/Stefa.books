import { NextRequest, NextResponse } from 'next/server';
import { 
  callClaudeOpus41, 
  generateWithThinking, 
  analyzeCodebase, 
  refactorCode,
  CLAUDE_MODELS 
} from '@/lib/claude';
import { bookAnalysis } from '@/lib/claude/book-analysis';
import { z } from 'zod';

const testRequestSchema = z.object({
  testType: z.enum([
    'basic',
    'thinking',
    'codeAnalysis', 
    'codeRefactor',
    'bookAnalysis',
    'bookRecommendations',
    'performance'
  ]),
  testData: z.record(z.any()).optional(),
});

// Sample data for testing
const sampleBook = {
  id: 'test-book-1',
  title: 'Гаррі Поттер і філософський камінь',
  author: 'Дж.К. Роулінг',
  category: 'Фантастика',
  description: 'Історія про хлопчика-чарівника, який дізнається про свої магічні здібності в день одинадцятого народження.',
  age_group: '10-14',
  price_uah: 350,
  available: true,
  cover_url: '/covers/harry-potter.jpg',
} as any;

const sampleCodeToAnalyze = `
import React, { useState, useEffect } from 'react';

const BookCard = ({ book }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // This effect runs on every render - BAD!
    fetchBookDetails();
  });
  
  const fetchBookDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/books/' + book.id);
      const data = await response.json();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="book-card">
      <h3>{book.title}</h3>
      <p>{book.author}</p>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, testData } = testRequestSchema.parse(body);

    let result: any = {};
    const startTime = Date.now();

    switch (testType) {
      case 'basic':
        result = await callClaudeOpus41({
          system: 'Ти помічник для тестування Claude Opus 4.1 в проекті Stefa.Books.',
          messages: [{ 
            role: 'user', 
            content: testData?.prompt || 'Привіт! Протестуй базову функціональність Opus 4.1.' 
          }],
          max_tokens: 1000,
        });
        break;

      case 'thinking':
        result = await generateWithThinking(
          testData?.prompt || 'Проанализируй архитектуру современного веб-приложения для детской библиотеки. Какие технологии лучше использовать?',
          'Ты senior архитектор веб-приложений с опытом работы с детскими проектами.',
          4000
        );
        break;

      case 'codeAnalysis':
        result = {
          analysis: await analyzeCodebase(
            testData?.code || sampleCodeToAnalyze,
            testData?.analysisType || 'review'
          )
        };
        break;

      case 'codeRefactor':
        result = await refactorCode(
          testData?.code || sampleCodeToAnalyze,
          testData?.goal || 'Оптимизировать производительность и исправить баги',
          testData?.preserveLogic !== false
        );
        break;

      case 'bookAnalysis':
        result = await bookAnalysis.analyzeBookContent(
          testData?.book || sampleBook
        );
        break;

      case 'bookRecommendations':
        const userPrefs = testData?.userPreferences || {
          childAge: 10,
          interests: ['фантастика', 'пригоди'],
          favoriteGenres: ['фентезі', 'пригодницька література'],
          readingLevel: 'intermediate' as const,
        };
        
        const books = testData?.availableBooks || [sampleBook];
        
        result = {
          recommendations: await bookAnalysis.generatePersonalizedRecommendations(
            userPrefs,
            books,
            3
          )
        };
        break;

      case 'performance':
        // Test multiple capabilities simultaneously
        const [basicTest, thinkingTest, bookTest] = await Promise.all([
          callClaudeOpus41({
            system: 'Короткий тест',
            messages: [{ role: 'user', content: 'Скажи "тест пройден"' }],
            max_tokens: 50,
          }),
          generateWithThinking(
            'Какие преимущества дает Opus 4.1 по сравнению с предыдущими моделями?',
            'Отвечай кратко и по существу.',
            500
          ),
          bookAnalysis.analyzeBookContent(sampleBook)
        ]);

        result = {
          basicTest: basicTest.content,
          thinkingTest: {
            content: thinkingTest.content,
            hasThinking: !!thinkingTest.thinking,
          },
          bookTest: bookTest.category,
          parallelExecution: 'Success'
        };
        break;

      default:
        throw new Error(`Unknown test type: ${testType}`);
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      testType,
      result,
      performance: {
        executionTimeMs: executionTime,
        model: CLAUDE_MODELS.OPUS_41,
        timestamp: new Date().toISOString(),
      },
      opus41Features: {
        thinkingMode: testType === 'thinking' || testType === 'codeAnalysis',
        maxTokens: 32000,
        sweBenchScore: '74.5%',
        multiFileRefactoring: testType === 'codeRefactor',
      }
    });

  } catch (error) {
    console.error('Claude test endpoint error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid test request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        testFailed: true
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Claude Opus 4.1 Test Endpoint',
    description: 'Тестирование возможностей Claude Opus 4.1 в проекте Stefa.Books',
    availableTests: {
      basic: {
        description: 'Базовый тест общения с моделью',
        parameters: { prompt: 'string (optional)' }
      },
      thinking: {
        description: 'Тест thinking mode для глубокого анализа',
        parameters: { prompt: 'string (optional)' }
      },
      codeAnalysis: {
        description: 'Анализ кода с использованием 74.5% SWE-bench точности',
        parameters: { 
          code: 'string (optional)', 
          analysisType: 'review|refactor|optimize|debug' 
        }
      },
      codeRefactor: {
        description: 'Рефакторинг кода с сохранением логики',
        parameters: { 
          code: 'string (optional)', 
          goal: 'string (optional)',
          preserveLogic: 'boolean (optional)'
        }
      },
      bookAnalysis: {
        description: 'Анализ детской книги для каталогизации',
        parameters: { book: 'Book object (optional)' }
      },
      bookRecommendations: {
        description: 'Персонализированные рекомендации книг',
        parameters: { 
          userPreferences: 'object (optional)',
          availableBooks: 'Book[] (optional)'
        }
      },
      performance: {
        description: 'Тест производительности параллельного выполнения',
        parameters: {}
      }
    },
    examples: {
      basicTest: {
        method: 'POST',
        body: {
          testType: 'basic',
          testData: { prompt: 'Протестируй Opus 4.1' }
        }
      },
      thinkingTest: {
        method: 'POST', 
        body: {
          testType: 'thinking',
          testData: { 
            prompt: 'Как оптимизировать детскую библиотеку для лучшего UX?' 
          }
        }
      },
      codeAnalysisTest: {
        method: 'POST',
        body: {
          testType: 'codeAnalysis',
          testData: { analysisType: 'review' }
        }
      }
    },
    features: {
      model: CLAUDE_MODELS.OPUS_41,
      maxTokens: 32000,
      thinkingTokens: 64000,
      sweBenchAccuracy: '74.5%',
      supportedLanguages: ['Ukrainian', 'English', 'Russian'],
      businessLogic: 'Book analysis and recommendations'
    }
  });
}