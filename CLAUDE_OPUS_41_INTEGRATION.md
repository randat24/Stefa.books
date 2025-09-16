# Claude Opus 4.1 Integration Guide

## 🎯 Описание

Проект Stefa.Books теперь интегрирован с Claude Opus 4.1 - самой мощной моделью Anthropic с 74.5% точностью на SWE-bench Verified и расширенными возможностями thinking режима.

## 📦 Что было добавлено

### 1. Основная библиотека (`src/lib/claude.ts`)
- **Поддержка всех моделей Claude 4**: Opus 4.1, Opus 4, Sonnet 4, Sonnet 3.5, Haiku 3.5
- **Thinking Mode**: До 64,000 токенов для глубокого анализа (только для Opus моделей)
- **Увеличенные лимиты**: До 32,000 выходных токенов для Opus 4.1
- **Специализированные функции**:
  - `callClaudeOpus41()` - оптимизированный вызов Opus 4.1
  - `generateWithThinking()` - генерация с thinking режимом
  - `analyzeCodebase()` - анализ кода с 74.5% точностью
  - `refactorCode()` - интеллектуальный рефакторинг кода

### 2. Бизнес-логика для книг (`src/lib/claude/book-analysis.ts`)
- **Анализ книг**: Автоматическая категоризация, определение возрастной группы, ключевые слова
- **Улучшение контента**: SEO оптимизация описаний, мета-теги, хештеги
- **Персональные рекомендации**: ИИ-основанные рекомендации книг для детей
- **Автоматическая категоризация**: Определение категорий новых книг

### 3. API Endpoints
- **`/api/claude`** - основной API с поддержкой всех моделей и thinking режима
- **`/api/claude/test`** - тестовый endpoint для проверки возможностей Opus 4.1

### 4. Переменные окружения
```bash
# Основной API ключ
ANTHROPIC_API_KEY="your-api-key"

# Конфигурация модели по умолчанию
CLAUDE_DEFAULT_MODEL="claude-opus-4-1-20250805"
CLAUDE_MAX_TOKENS="32000"
CLAUDE_ENABLE_THINKING="true"
```

## 🚀 Как использовать

### Базовое использование в компонентах

```typescript
import { generateText, callClaudeOpus41, CLAUDE_MODELS } from '@/lib/claude';

// Простая генерация текста
const response = await generateText(
  'Опиши переваги цієї дитячої книги',
  'Ти бібліотекар дитячої бібліотеки',
  CLAUDE_MODELS.OPUS_41
);

// Использование thinking режима
const analysis = await generateWithThinking(
  'Проанализируй архитектуру этого React компонента',
  'Ты senior React разработчик',
  8000
);
console.log('Analysis:', analysis.content);
console.log('Thinking process:', analysis.thinking);
```

### Анализ и улучшение книг

```typescript
import { bookAnalysis } from '@/lib/claude/book-analysis';

// Анализ книги
const bookAnalysisResult = await bookAnalysis.analyzeBookContent(book);
console.log('Category:', bookAnalysisResult.category);
console.log('Age group:', bookAnalysisResult.ageGroup);
console.log('Keywords:', bookAnalysisResult.keywords);

// Улучшение контента
const improvements = await bookAnalysis.improveBookContent(book);
console.log('Improved description:', improvements.improvedDescription);
console.log('SEO keywords:', improvements.seoKeywords);

// Персональные рекомендации
const recommendations = await bookAnalysis.generatePersonalizedRecommendations(
  {
    childAge: 8,
    interests: ['пригоди', 'фантастика'],
    favoriteGenres: ['фентезі'],
    readingLevel: 'intermediate'
  },
  availableBooks,
  5
);
```

### Анализ и рефакторинг кода

```typescript
import { analyzeCodebase, refactorCode } from '@/lib/claude';

// Анализ кода
const codeReview = await analyzeCodebase(
  componentCode,
  'review' // или 'refactor', 'optimize', 'debug'
);

// Рефакторинг кода
const refactoredResult = await refactorCode(
  componentCode,
  'Оптимизировать производительность и исправить баги',
  true // сохранить логику
);
console.log('Refactored code:', refactoredResult.refactoredCode);
console.log('Explanation:', refactoredResult.explanation);
console.log('Thinking:', refactoredResult.thinking);
```

### HTTP API использование

```javascript
// Базовый запрос
const response = await fetch('/api/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Привіт! Як справи?',
    system: 'Ти помічник для дитячої бібліотеки',
    model: 'claude-opus-4-1-20250805',
    max_tokens: 2000,
    thinking: true
  })
});

const data = await response.json();
console.log('Response:', data.content);
if (data.thinking_content) {
  console.log('Thinking:', data.thinking_content);
}

// Тестирование функций
const testResponse = await fetch('/api/claude/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    testType: 'thinking',
    testData: {
      prompt: 'Как оптимизировать детскую библиотеку?'
    }
  })
});
```

## 🎯 Ключевые возможности Opus 4.1

### 1. Thinking Mode
- До 64,000 токенов для внутреннего анализа
- Видимый процесс рассуждений модели
- Лучшее качество сложных задач

### 2. Улучшенное программирование
- **74.5% точность на SWE-bench Verified** (vs 72.5% у Opus 4)
- Многофайловый рефакторинг
- Точные исправления в больших кодовых базах

### 3. Глубокий анализ
- Улучшенные исследования и анализ данных
- Лучшее отслеживание деталей
- 78% на AIME 2025 (vs 75.5% у Opus 4)

### 4. Повышенная безопасность
- 98.76% harmless response rate (vs 97.27% у Opus 4)
- 25% снижение кооперации с рискованными сценариями

## 🧪 Тестирование интеграции

### 1. Проверка доступности API
```bash
curl http://localhost:3000/api/claude
```

### 2. Базовый тест
```bash
curl -X POST http://localhost:3000/api/claude/test \
  -H "Content-Type: application/json" \
  -d '{"testType": "basic"}'
```

### 3. Тест thinking режима
```bash
curl -X POST http://localhost:3000/api/claude/test \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "thinking",
    "testData": {
      "prompt": "Как улучшить UX детской библиотеки?"
    }
  }'
```

### 4. Тест анализа кода
```bash
curl -X POST http://localhost:3000/api/claude/test \
  -H "Content-Type: application/json" \
  -d '{"testType": "codeAnalysis"}'
```

## 📊 Производительность

- **Модель по умолчанию**: Claude Opus 4.1 (`claude-opus-4-1-20250805`)
- **Максимальные токены**: 32,000 (вывод) + 200,000 (контекст)
- **Thinking токены**: До 64,000 для глубокого анализа
- **Цена**: Такая же как у Opus 4
- **Языки**: Украинский, английский, русский и другие

## 🔧 Конфигурация

### Переменные окружения (.env.local)
```bash
# Обязательно
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Опционально (значения по умолчанию)
CLAUDE_DEFAULT_MODEL="claude-opus-4-1-20250805"
CLAUDE_MAX_TOKENS="32000"
CLAUDE_ENABLE_THINKING="true"
```

### Настройка в коде
```typescript
// Изменение модели по умолчанию
import { CLAUDE_MODELS } from '@/lib/claude';

// Использование конкретной модели
const response = await callClaude({
  model: CLAUDE_MODELS.SONNET_4, // Быстрее, дешевле
  // или
  model: CLAUDE_MODELS.OPUS_41,  // Максимальная мощность
  messages: [...],
  thinking: true, // Только для Opus моделей
});
```

## 🎯 Практические применения в Stefa.Books

### 1. Контент-менеджмент
- Автоматическое улучшение описаний книг
- SEO оптимизация текстов
- Генерация мета-тегов и хештегов

### 2. Персонализация
- ИИ-рекомендации книг по возрасту и интересам
- Анализ предпочтений пользователей
- Адаптивные описания для разных возрастных групп

### 3. Развитие кодовой базы
- Автоматический код-ревью
- Рефакторинг компонентов React/TypeScript
- Оптимизация производительности

### 4. Аналитика и отчеты
- Анализ популярности книг
- Trends и паттерны в детском чтении
- Рекомендации по пополнению каталога

## ✅ Результат интеграции

Проект Stefa.Books теперь имеет доступ к самой мощной ИИ-модели Claude для:

- **Улучшения качества контента** с помощью 74.5% SWE-bench точности
- **Персонализированных рекомендаций** на основе глубокого понимания детской литературы  
- **Автоматизации рутинных задач** каталогизации и контент-менеджмента
- **Интеллектуального развития кодовой базы** с thinking режимом до 64K токенов

Интеграция полностью обратно совместима и готова к продакшн использованию! 🚀