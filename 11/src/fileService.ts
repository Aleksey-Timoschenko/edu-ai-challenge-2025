import * as fs from 'fs-extra';
import * as path from 'path';
import { TranscriptionResult, SummaryResult, AnalysisResult } from './types';

export class FileService {
  private outputDir: string;

  constructor(outputDir: string = './output') {
    this.outputDir = outputDir;
  }

  async ensureOutputDirectory(): Promise<void> {
    await fs.ensureDir(this.outputDir);
  }

  async saveTranscription(transcription: TranscriptionResult, audioFileName: string): Promise<string> {
    await this.ensureOutputDirectory();

    const timestamp = this.getTimestamp();
    const baseName = path.parse(audioFileName).name;
    const fileName = `transcription_${baseName}_${timestamp}.md`;
    const filePath = path.join(this.outputDir, fileName);

    const content = this.formatTranscriptionContent(transcription, audioFileName);

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`📄 Transcription saved to: ${filePath}`);

    return filePath;
  }

  async saveSummary(summary: SummaryResult, audioFileName: string): Promise<string> {
    await this.ensureOutputDirectory();

    const timestamp = this.getTimestamp();
    const baseName = path.parse(audioFileName).name;
    const fileName = `summary_${baseName}_${timestamp}.md`;
    const filePath = path.join(this.outputDir, fileName);

    const content = this.formatSummaryContent(summary, audioFileName);

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`📄 Summary saved to: ${filePath}`);

    return filePath;
  }

  async saveAnalysis(analysis: AnalysisResult, audioFileName: string): Promise<string> {
    await this.ensureOutputDirectory();

    const timestamp = this.getTimestamp();
    const baseName = path.parse(audioFileName).name;
    const fileName = `analysis_${baseName}_${timestamp}.json`;
    const filePath = path.join(this.outputDir, fileName);

    await fs.writeJson(filePath, analysis, { spaces: 2 });
    console.log(`📄 Analysis saved to: ${filePath}`);

    return filePath;
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  private formatTranscriptionContent(transcription: TranscriptionResult, audioFileName: string): string {
    const timestamp = new Date().toISOString();

    return `# Audio Transcription

**Source File:** ${audioFileName}
**Generated:** ${timestamp}
${transcription.duration ? `**Duration:** ${this.formatDuration(transcription.duration)}` : ''}

## Transcription

${transcription.text}
`;
  }

  private formatSummaryContent(summary: SummaryResult, audioFileName: string): string {
    const timestamp = new Date().toISOString();

    return `# Audio Summary

**Source File:** ${audioFileName}
**Generated:** ${timestamp}

## Summary

${summary.summary}
`;
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}