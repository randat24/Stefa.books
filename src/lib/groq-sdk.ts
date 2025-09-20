// Заглушка для groq-sdk
export const Groq = class {
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async chat() {
    return {
      completions: {
        create: async () => ({
          choices: [{ message: { content: 'Groq SDK not implemented' } }]
        })
      }
    };
  }
};

export default Groq;
