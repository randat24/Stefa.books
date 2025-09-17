import { NextRequest, NextResponse } from 'next/server';
import { callClaude, CLAUDE_MODELS, type ClaudeModel } from '@/lib/claude';
import { z } from 'zod';

const requestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  system: z.string().optional(),
  model: z.enum([
    CLAUDE_MODELS.OPUS_41,
    CLAUDE_MODELS.OPUS_4,
    CLAUDE_MODELS.SONNET_4,
    CLAUDE_MODELS.SONNET_35,
    CLAUDE_MODELS.HAIKU_35,
  ]).optional(),
  max_tokens: z.number().min(1).max(32000).optional(),
  temperature: z.number().min(0).max(1).optional(),
  thinking: z.boolean().optional() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, system, model, max_tokens, temperature, thinking } = requestSchema.parse(body);

    const response = await callClaude({
      system,
      messages: [{ role: 'user', content: prompt }],
      model: model as ClaudeModel,
      max_tokens,
      temperature,
      thinking });

    return NextResponse.json({
      success: true,
      content: response.content,
      thinking_content: response.thinking_content,
      usage: response.usage,
      model_used: model || CLAUDE_MODELS.OPUS_41 });
  } catch (error) {
    console.error('Claude API route error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Claude API endpoint - use POST to send requests',
    defaultModel: CLAUDE_MODELS.OPUS_41,
    availableModels: {
      latest: {
        name: 'Claude Opus 4.1',
        id: CLAUDE_MODELS.OPUS_41,
        description: 'Найпотужніша модель з 74.5% SWE-bench performance',
        maxTokens: 32000,
        features: ['thinking mode', 'code refactoring', 'deep analysis'] },
      alternatives: [
        {
          name: 'Claude Opus 4',
          id: CLAUDE_MODELS.OPUS_4,
          maxTokens: 32000 },
        {
          name: 'Claude Sonnet 4',
          id: CLAUDE_MODELS.SONNET_4,
          maxTokens: 8000 },
        {
          name: 'Claude 3.5 Sonnet',
          id: CLAUDE_MODELS.SONNET_35,
          maxTokens: 8000 },
        {
          name: 'Claude 3.5 Haiku',
          id: CLAUDE_MODELS.HAIKU_35,
          maxTokens: 8000 },
      ] },
    examples: {
      basic: {
        prompt: 'Привіт! Як справи?',
        system: 'Ти помічник для українського сайту дитячих книг.',
        model: CLAUDE_MODELS.OPUS_41,
        max_tokens: 1000,
        temperature: 0.1 },
      withThinking: {
        prompt: 'Проанализируй этот React компонент и предложи улучшения',
        system: 'Ты експерт по React и TypeScript.',
        model: CLAUDE_MODELS.OPUS_41,
        max_tokens: 8000,
        temperature: 0.1,
        thinking: true },
      bookRecommendation: {
        prompt: 'Ребенок 8 лет любит приключения и фантастику',
        system: 'Ты библиотекарь Stefa.Books. Рекомендуй книги детям.',
        model: CLAUDE_MODELS.OPUS_41,
        max_tokens: 2000,
        temperature: 0.3 } },
    features: {
      thinkingMode: 'Доступен для Opus моделей - глубокий анализ до 64,000 токенов',
      codeRefactoring: 'Opus 4.1 показывает 74.5% точность на SWE-bench',
      multiLanguage: 'Поддержка украинского, английского и других языков',
      businessLogic: 'Специальные функции для книжного бизнеса' } });
}