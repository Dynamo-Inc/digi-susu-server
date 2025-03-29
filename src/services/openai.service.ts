import { Service } from 'typedi';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../config';
import { logger } from '../utils/logger';

@Service()
export default class AiChatService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  public async getSusuInsight(prompt: string): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a financial AI assistant helping users understand the status of their rotating savings (susu) group. 
Respond with helpful and forward-looking insights based on the user's contribution behavior, consistency, and the group's performance. Keep the tone friendly, local, and insightful.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      const output = response.choices[0].message.content;
      logger.info('AI response generated successfully');
      return output;
    } catch (error) {
      logger.error('AI processing failed:', error);
      throw new Error(`Failed to generate AI response: ${error}`);
    }
  }
}
