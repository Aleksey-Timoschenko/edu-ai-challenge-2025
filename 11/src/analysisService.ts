import OpenAI from 'openai';
import { AnalysisResult } from './types';

export class AnalysisService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async analyzeTranscription(transcription: string, duration?: number): Promise<AnalysisResult> {
    try {
      console.log('🔄 Analyzing transcription...');

      // Calculate basic statistics
      const wordCount = this.calculateWordCount(transcription);
      const speakingSpeedWpm = duration ? this.calculateSpeakingSpeed(wordCount, duration) : 0;

      // Extract topics using GPT
      const topics = await this.extractTopics(transcription);

      console.log('✅ Analysis completed successfully!');

      return {
        word_count: wordCount,
        speaking_speed_wpm: Math.round(speakingSpeedWpm),
        frequently_mentioned_topics: topics,
      };
    } catch (error) {
      console.error('❌ Error analyzing transcription:', error);
      throw new Error(`Failed to analyze transcription: ${error}`);
    }
  }

  private calculateWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateSpeakingSpeed(wordCount: number, durationSeconds: number): number {
    const durationMinutes = durationSeconds / 60;
    return wordCount / durationMinutes;
  }

  private async extractTopics(transcription: string): Promise<Array<{ topic: string; mentions: number }>> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing text and identifying the most frequently mentioned topics. Return only a JSON array of objects with "topic" and "mentions" fields, sorted by mention count in descending order. Include at least 3 topics if possible.'
          },
          {
            role: 'user',
            content: `Analyze the following transcription and identify the top 3+ most frequently mentioned topics with their mention counts:\n\n${transcription}`
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
      });

      const response = completion.choices[0]?.message?.content || '[]';

      try {
        const topics = JSON.parse(response);
        if (Array.isArray(topics)) {
          return topics.slice(0, 5); // Limit to top 5 topics
        }
      } catch (parseError) {
        console.warn('Failed to parse topics JSON, using fallback analysis');
      }

      // Fallback: simple keyword analysis
      return this.fallbackTopicAnalysis(transcription);
    } catch (error) {
      console.warn('GPT topic extraction failed, using fallback analysis');
      return this.fallbackTopicAnalysis(transcription);
    }
  }

  private fallbackTopicAnalysis(transcription: string): Array<{ topic: string; mentions: number }> {
    const words = transcription.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCounts: { [key: string]: number } = {};

    // Count word frequencies (excluding common stop words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    // Get top words
    const sortedWords = Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({
        topic: word.charAt(0).toUpperCase() + word.slice(1),
        mentions: count
      }));

    return sortedWords;
  }
}