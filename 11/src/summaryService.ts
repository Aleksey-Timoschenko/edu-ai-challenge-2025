import OpenAI from 'openai';
import { SummaryResult } from './types';

export class SummaryService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async summarizeTranscription(transcription: string): Promise<SummaryResult> {
    try {
      console.log('🔄 Generating summary...');

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, well-structured summaries of transcribed audio content. Focus on the main points, key insights, and important details while maintaining clarity and readability.'
          },
          {
            role: 'user',
            content: `Please provide a comprehensive summary of the following transcription:\n\n${transcription}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const summary = completion.choices[0]?.message?.content || 'No summary generated';

      console.log('✅ Summary generated successfully!');

      return {
        summary: summary.trim(),
      };
    } catch (error) {
      console.error('❌ Error generating summary:', error);
      throw new Error(`Failed to generate summary: ${error}`);
    }
  }
}