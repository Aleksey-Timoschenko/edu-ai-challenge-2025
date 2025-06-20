import OpenAI from 'openai';
import { TranscriptionResult } from './types';

export class TranscriptionService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
    try {
      console.log('🔄 Transcribing audio file...');

      const transcription = await this.openai.audio.transcriptions.create({
        file: await this.createFileFromPath(audioFilePath),
        model: 'whisper-1',
        response_format: 'verbose_json',
      });

      console.log('✅ Transcription completed successfully!');

      return {
        text: transcription.text,
        duration: transcription.duration,
      };
    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      throw new Error(`Failed to transcribe audio: ${error}`);
    }
  }

  private async createFileFromPath(filePath: string): Promise<File> {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    const buffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    return new File([buffer], fileName, {
      type: this.getMimeType(fileName),
    });
  }

  private getMimeType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();

    const mimeTypes: { [key: string]: string } = {
      'mp3': 'audio/mpeg',
      'mp4': 'audio/mp4',
      'm4a': 'audio/mp4',
      'wav': 'audio/wav',
      'flac': 'audio/flac',
      'ogg': 'audio/ogg',
      'webm': 'audio/webm',
    };

    return mimeTypes[extension || ''] || 'audio/mpeg';
  }
}