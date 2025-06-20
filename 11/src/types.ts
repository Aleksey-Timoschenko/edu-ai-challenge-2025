export interface TranscriptionResult {
  text: string;
  duration?: number;
}

export interface SummaryResult {
  summary: string;
}

export interface AnalysisResult {
  word_count: number;
  speaking_speed_wpm: number;
  frequently_mentioned_topics: Array<{
    topic: string;
    mentions: number;
  }>;
}

export interface ProcessingResult {
  transcription: TranscriptionResult;
  summary: SummaryResult;
  analysis: AnalysisResult;
  transcriptionFile: string;
  summaryFile: string;
  analysisFile: string;
}