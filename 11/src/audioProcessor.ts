import * as path from 'path';
import { TranscriptionService } from './transcriptionService';
import { SummaryService } from './summaryService';
import { AnalysisService } from './analysisService';
import { FileService } from './fileService';
import { ProcessingResult } from './types';

export class AudioProcessor {
  private transcriptionService: TranscriptionService;
  private summaryService: SummaryService;
  private analysisService: AnalysisService;
  private fileService: FileService;

  constructor(apiKey: string) {
    this.transcriptionService = new TranscriptionService(apiKey);
    this.summaryService = new SummaryService(apiKey);
    this.analysisService = new AnalysisService(apiKey);
    this.fileService = new FileService();
  }

  async processAudioFile(audioFilePath: string): Promise<ProcessingResult> {
    try {
      console.log(`🎵 Processing audio file: ${audioFilePath}`);

      // Validate file exists
      if (!await this.fileExists(audioFilePath)) {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      const audioFileName = path.basename(audioFilePath);

      // Step 1: Transcribe audio
      const transcription = await this.transcriptionService.transcribeAudio(audioFilePath);

      // Step 2: Generate summary
      const summary = await this.summaryService.summarizeTranscription(transcription.text);

      // Step 3: Analyze transcription
      const analysis = await this.analysisService.analyzeTranscription(transcription.text, transcription.duration);

      // Step 4: Save all results to files
      const transcriptionFile = await this.fileService.saveTranscription(transcription, audioFileName);
      const summaryFile = await this.fileService.saveSummary(summary, audioFileName);
      const analysisFile = await this.fileService.saveAnalysis(analysis, audioFileName);

      console.log('\n🎉 Audio processing completed successfully!');

      return {
        transcription,
        summary,
        analysis,
        transcriptionFile,
        summaryFile,
        analysisFile,
      };
    } catch (error) {
      console.error('❌ Error processing audio file:', error);
      throw error;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    const fs = require('fs-extra');
    return await fs.pathExists(filePath);
  }

  displayResults(result: ProcessingResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PROCESSING RESULTS');
    console.log('='.repeat(60));

    console.log('\n📝 SUMMARY:');
    console.log('-'.repeat(30));
    console.log(result.summary.summary);

    console.log('\n📈 ANALYSIS:');
    console.log('-'.repeat(30));
    console.log(`Word Count: ${result.analysis.word_count}`);
    console.log(`Speaking Speed: ${result.analysis.speaking_speed_wpm} words per minute`);

    console.log('\n🔥 FREQUENTLY MENTIONED TOPICS:');
    console.log('-'.repeat(30));
    result.analysis.frequently_mentioned_topics.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic.topic}: ${topic.mentions} mentions`);
    });

    console.log('\n📁 FILES SAVED:');
    console.log('-'.repeat(30));
    console.log(`Transcription: ${result.transcriptionFile}`);
    console.log(`Summary: ${result.summaryFile}`);
    console.log(`Analysis: ${result.analysisFile}`);

    console.log('\n' + '='.repeat(60));
  }
}