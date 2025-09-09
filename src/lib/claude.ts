// Автоматическое переключение на бесплатную модель Groq
const USE_FREE_MODEL = !process.env.ANTHROPIC_API_KEY || process.env.USE_FREE_MODEL === 'true';

let anthropic: any = null;
let groq: any = null;

async function initializeClients() {
  if (!USE_FREE_MODEL && !anthropic) {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  } else if (USE_FREE_MODEL && !groq) {
    // Инициализируем бесплатный Groq API
    const { Groq } = await import('groq-sdk');
    groq = new Groq({
      // Groq имеет бесплатный тариф без ключа для многих моделей
      apiKey: process.env.GROQ_API_KEY || 'free-tier', 
    });
  }
}

// Модели для разных провайдеров
export const AI_MODELS = {
  // Claude модели (требуют API ключ)
  CLAUDE_OPUS_41: 'claude-opus-4-1-20250805',
  CLAUDE_OPUS_4: 'claude-opus-4-20250514', 
  CLAUDE_SONNET_4: 'claude-sonnet-4-20250514',
  CLAUDE_SONNET_35: 'claude-3-5-sonnet-20241022',
  CLAUDE_HAIKU_35: 'claude-3-5-haiku-20241022',
  
  // Бесплатные модели Groq
  GROQ_LLAMA_3_70B: 'llama3-70b-8192',
  GROQ_LLAMA_3_8B: 'llama3-8b-8192',
  GROQ_MIXTRAL: 'mixtral-8x7b-32768',
  GROQ_GEMMA_7B: 'gemma-7b-it',
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

// Выбор модели по умолчанию в зависимости от доступности
const DEFAULT_MODEL = USE_FREE_MODEL 
  ? AI_MODELS.GROQ_LLAMA_3_70B  // Лучшая бесплатная модель
  : (process.env.CLAUDE_DEFAULT_MODEL as AIModel || AI_MODELS.CLAUDE_OPUS_41);

const DEFAULT_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '4000', 10);
const ENABLE_THINKING = process.env.AI_ENABLE_THINKING === 'true';

// Для обратной совместимости
export const CLAUDE_MODELS = {
  OPUS_41: AI_MODELS.CLAUDE_OPUS_41,
  OPUS_4: AI_MODELS.CLAUDE_OPUS_4,
  SONNET_4: AI_MODELS.CLAUDE_SONNET_4,
  SONNET_35: AI_MODELS.CLAUDE_SONNET_35,
  HAIKU_35: AI_MODELS.CLAUDE_HAIKU_35,
} as const;

export type ClaudeModel = typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS];

export interface ClaudeRequest {
  system?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  model?: AIModel;
  max_tokens?: number;
  temperature?: number;
  thinking?: boolean;
}

export interface ClaudeResponse {
  content: string;
  thinking_content?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    thinking_tokens?: number;
  };
}

export async function callClaude({
  system,
  messages,
  model = DEFAULT_MODEL,
  max_tokens = DEFAULT_MAX_TOKENS,
  temperature = 0.1,
  thinking = false,
}: ClaudeRequest): Promise<ClaudeResponse> {
  try {
    // Инициализируем клиенты при первом вызове
    await initializeClients();
    // Определяем, используем ли бесплатную модель
    const isGroqModel = USE_FREE_MODEL || model.includes('llama') || model.includes('mixtral') || model.includes('gemma');

    if (isGroqModel && groq) {
      // Используем бесплатный Groq API
      const groqModel = model.includes('llama') || model.includes('mixtral') || model.includes('gemma') 
        ? model 
        : AI_MODELS.GROQ_LLAMA_3_70B;

      const response = await groq.chat.completions.create({
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        model: groqModel,
        max_tokens,
        temperature,
      });

      const result: ClaudeResponse = {
        content: response.choices[0]?.message?.content || '',
        usage: {
          input_tokens: response.usage?.prompt_tokens || 0,
          output_tokens: response.usage?.completion_tokens || 0,
        },
      };

      return result;

    } else if (!USE_FREE_MODEL && anthropic) {
      // Используем Claude API (требует ключ)
      const requestBody: any = {
        model,
        max_tokens,
        temperature,
        system,
        messages,
      };

      // Enable thinking mode for Opus models if requested
      if (thinking && (model === CLAUDE_MODELS.OPUS_41 || model === CLAUDE_MODELS.OPUS_4)) {
        requestBody.thinking = true;
        requestBody.max_thinking_tokens = ENABLE_THINKING ? 64000 : undefined;
      }

      const response = await anthropic.messages.create(requestBody);

      if (response.content[0].type === 'text') {
        const result: ClaudeResponse = {
          content: response.content[0].text,
          usage: {
            input_tokens: response.usage.input_tokens,
            output_tokens: response.usage.output_tokens,
          },
        };

        // Handle thinking content if present
        if ('thinking' in response && response.thinking) {
          result.thinking_content = String(response.thinking);
          if (response.usage && 'thinking_tokens' in response.usage) {
            result.usage!.thinking_tokens = (response.usage as any).thinking_tokens;
          }
        }

        return result;
      }

      throw new Error('Unexpected response format from Claude API');

    } else {
      // Fallback: симуляция ответа для разработки
      console.warn('🤖 Используется симулированный AI ответ (нет API ключей)');
      
      const simulatedResponse: ClaudeResponse = {
        content: `Привіт! Це симулований відповідь AI моделі. 

Ваше повідомлення: "${messages[messages.length - 1]?.content || 'Немає повідомлення'}"

📝 Для повної функціональності:
- Додайте ANTHROPIC_API_KEY для Claude
- Або отримайте безкоштовний ключ Groq на https://console.groq.com

🚀 Поточна модель: ${model} (симуляція)
📊 Система: ${system || 'Загальний помічник'}`,
        usage: {
          input_tokens: 50,
          output_tokens: 150,
        },
      };

      return simulatedResponse;
    }

  } catch (error) {
    console.error('Ошибка при вызове AI API:', error);
    
    // Fallback в случае ошибки
    return {
      content: `⚠️ Помилка AI API: ${error instanceof Error ? error.message : 'Unknown error'}

🔧 Рекомендації:
1. Перевірте інтернет з'єднання
2. Перевірте API ключі
3. Спробуйте пізніше

Модель: ${model}
Використовується безкоштовна модель: ${USE_FREE_MODEL ? 'Так' : 'Ні'}`,
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };
  }
}

export async function generateText(
  prompt: string,
  systemPrompt?: string,
  model: AIModel = DEFAULT_MODEL
): Promise<string> {
  const response = await callClaude({
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
    model,
  });
  
  return response.content;
}

export async function analyzeContent(
  content: string,
  analysisType: 'summary' | 'translate' | 'improve' | 'analyze' = 'analyze',
  model: AIModel = DEFAULT_MODEL
): Promise<string> {
  const systemPrompts = {
    summary: 'Создай краткое резюме предоставленного контента на украинском языке.',
    translate: 'Переведи текст на украинский язык, сохраняя стиль и смысл.',
    improve: 'Улучши предоставленный текст, исправив грамматику и стиль.',
    analyze: 'Проанализируй предоставленный контент и дай рекомендации.',
  };

  return generateText(content, systemPrompts[analysisType], model);
}

// Specialized functions for Opus 4.1
export async function callClaudeOpus41({
  system,
  messages,
  max_tokens = 32000,
  temperature = 0.1,
  thinking = false,
}: Omit<ClaudeRequest, 'model'>): Promise<ClaudeResponse> {
  return callClaude({
    system,
    messages,
    model: CLAUDE_MODELS.OPUS_41,
    max_tokens,
    temperature,
    thinking,
  });
}

export async function generateWithThinking(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 16000
): Promise<{ content: string; thinking?: string; usage?: ClaudeResponse['usage'] }> {
  const response = await callClaudeOpus41({
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    thinking: true,
  });

  return {
    content: response.content,
    thinking: response.thinking_content,
    usage: response.usage,
  };
}

export async function analyzeCodebase(
  codeContent: string,
  analysisType: 'refactor' | 'optimize' | 'review' | 'debug' = 'review'
): Promise<string> {
  const systemPrompts = {
    refactor: 'Ты експерт по рефакторингу коду. Проанализируй предоставленный код и предложи улучшения для читабельности, производительности и поддерживаемости. Используй лучшие практики TypeScript и React.',
    optimize: 'Ты експерт по оптимизации производительности. Проанализируй код и найди возможности для улучшения производительности, уменьшения размера бандла и оптимизации рендеринга.',
    review: 'Ты Senior разработчик. Проведи полный код-ревью предоставленного кода. Найди потенциальные баги, проблемы безопасности, нарушения лучших практик и предложи улучшения.',
    debug: 'Ты експерт по отладке. Найди и проанализируй потенциальные баги в коде. Объясни причины проблем и предложи решения.',
  };

  const response = await callClaudeOpus41({
    system: systemPrompts[analysisType],
    messages: [{ role: 'user', content: codeContent }],
    thinking: true,
    max_tokens: 24000,
  });

  return response.content;
}

export async function refactorCode(
  codeContent: string,
  refactorGoal: string,
  preserveLogic = true
): Promise<{ refactoredCode: string; explanation: string; thinking?: string }> {
  const systemPrompt = `
Ты експерт по рефакторингу TypeScript/React кода. 
Цель рефакторинга: ${refactorGoal}
${preserveLogic ? 'ВАЖНО: Сохрани всю функциональную логику без изменений.' : ''}

Предоставь:
1. Отрефакторированный код
2. Объяснение изменений на украинском языке
3. Список улучшений

Формат ответа:
## Отрефакторированный код
\`\`\`typescript
// код здесь
\`\`\`

## Объяснение изменений
// объяснение здесь

## Список улучшений
// список улучшений
  `.trim();

  const response = await generateWithThinking(
    `Отрефактори этот код:\n\n${codeContent}`,
    systemPrompt,
    28000
  );

  // Parse response to extract code and explanation
  const content = response.content;
  const codeMatch = content.match(/```(?:typescript|ts|tsx)\n([\s\S]*?)\n```/);
  const explanationMatch = content.match(/## Объяснение изменений\n([\s\S]*?)(?=\n## |$)/);

  return {
    refactoredCode: codeMatch?.[1] || content,
    explanation: explanationMatch?.[1]?.trim() || content,
    thinking: response.thinking,
  };
}

export async function generateBookRecommendations(
  userPreferences: string,
  availableBooks: string,
  maxRecommendations = 5
): Promise<string> {
  const systemPrompt = `
Ты співробітник дитячої бібліотеки Stefa.Books. Твоя задача - рекомендувати книги дітям та їх батькам.
Аналізуй уподобання користувача та доступні книги, щоб створити персоналізовані рекомендації.
Відповідай українською мовою в дружньому тоні.
  `.trim();

  return generateText(
    `Користувач шукає: ${userPreferences}\n\nДоступні книги:\n${availableBooks}\n\nСкільки рекомендацій: ${maxRecommendations}`,
    systemPrompt,
    CLAUDE_MODELS.OPUS_41
  );
}

export const claude = {
  // Core functions
  callClaude,
  generateText,
  analyzeContent,
  
  // Opus 4.1 specific functions
  callClaudeOpus41,
  generateWithThinking,
  analyzeCodebase,
  refactorCode,
  
  // Business logic functions
  generateBookRecommendations,
  
  // Constants
  MODELS: CLAUDE_MODELS,
};