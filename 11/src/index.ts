#!/usr/bin/env node

import * as dotenv from 'dotenv';
import * as path from 'path';
import { AudioProcessor } from './audioProcessor';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0) {
      displayUsage();
      process.exit(1);
    }

    const audioFilePath = args[0];

    // Check if help is requested
    if (audioFilePath === '--help' || audioFilePath === '-h') {
      displayUsage();
      process.exit(0);
    }

    // Validate OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ Error: OPENAI_API_KEY environment variable is not set.');
      console.log('Please set your OpenAI API key in a .env file or as an environment variable.');
      console.log('Example: OPENAI_API_KEY=your_api_key_here');
      process.exit(1);
    }

    // Validate audio file path
    if (!audioFilePath) {
      console.error('❌ Error: No audio file path provided.');
      displayUsage();
      process.exit(1);
    }

    // Resolve relative path to absolute path
    const resolvedPath = path.resolve(audioFilePath);

    // Check if file exists
    const fs = require('fs-extra');
    if (!await fs.pathExists(resolvedPath)) {
      console.error(`❌ Error: Audio file not found: ${resolvedPath}`);
      process.exit(1);
    }

    // Check if it's actually a file
    const stats = await fs.stat(resolvedPath);
    if (!stats.isFile()) {
      console.error(`❌ Error: Path is not a file: ${resolvedPath}`);
      process.exit(1);
    }

    console.log('🚀 Starting Audio Transcription and Analysis...\n');

    // Create processor and process the audio file
    const processor = new AudioProcessor(apiKey);
    const result = await processor.processAudioFile(resolvedPath);

    // Display results
    processor.displayResults(result);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

function displayUsage() {
  console.log(`
🎵 Audio Transcription and Analysis Tool

USAGE:
  npm start <audio-file-path>
  node dist/index.js <audio-file-path>
  ts-node src/index.ts <audio-file-path>

EXAMPLES:
  npm start ./audio/meeting.mp3
  npm start /path/to/your/audio.wav
  npm start recording.m4a

SUPPORTED AUDIO FORMATS:
  - MP3 (.mp3)
  - MP4 (.mp4)
  - M4A (.m4a)
  - WAV (.wav)
  - FLAC (.flac)
  - OGG (.ogg)
  - WebM (.webm)

REQUIREMENTS:
  - OpenAI API key set in OPENAI_API_KEY environment variable
  - Audio file must exist and be accessible

OUTPUT:
  The tool will create three files in the ./output directory:
  - transcription_<filename>_<timestamp>.md
  - summary_<filename>_<timestamp>.md
  - analysis_<filename>_<timestamp>.json

OPTIONS:
  --help, -h    Show this help message
`);
}

// Run the application
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}