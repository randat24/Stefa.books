export * from './claude/book-analysis';

// Временные заглушки для отсутствующих функций
export const CLAUDE_MODELS = {
  OPUS_41: 'claude-3-5-sonnet-20241022'
};

export const callClaude = async (prompt: string) => {
  return { error: 'Claude API not implemented' };
};

export const callClaudeOpus41 = async (prompt: string) => {
  return { error: 'Claude API not implemented' };
};

export const generateWithThinking = async (prompt: string, systemPrompt?: string, maxTokens?: number) => {
  return {
    error: 'Claude API not implemented',
    content: '',
    thinking: ''
  };
};
