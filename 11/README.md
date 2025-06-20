# Audio Transcription and Analysis Tool

A powerful console application that transcribes audio files using OpenAI's Whisper API, generates intelligent summaries using GPT, and extracts detailed analytics including word count, speaking speed, and frequently mentioned topics.

## Features

- 🎵 **Audio Transcription**: Transcribe any audio file using OpenAI's Whisper API
- 📝 **Intelligent Summaries**: Generate concise summaries using gpt-4.1-mini
- 📊 **Detailed Analytics**: Extract word count, speaking speed, and topic analysis
- 📁 **File Management**: Automatically save results to organized files with timestamps
- 🎯 **Multiple Formats**: Support for MP3, MP4, M4A, WAV, FLAC, OGG, and WebM
- 🔧 **Easy to Use**: Simple command-line interface with helpful error messages

## Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- OpenAI API key

## Installation

1. **Clone or download the project**
   ```bash
   # If you have the project files, navigate to the directory
   cd 11
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your OpenAI API key**

   Create a `.env` file in the project root:
   ```bash
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

   Or set it as an environment variable:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Usage

### Basic Usage

```bash
# Process an audio file
npm start /path/to/your/audio.mp3

# Or use the compiled version directly
node dist/index.js /path/to/your/audio.wav

# Or use ts-node for development
npm run dev /path/to/your/audio.m4a
```

### Examples

```bash
# Process an MP3 file
npm start ./audio/meeting.mp3

# Process a WAV file with absolute path
npm start /Users/username/Downloads/recording.wav

# Process an M4A file
npm start interview.m4a
```

### Getting Help

```bash
npm start --help
# or
npm start -h
```

## Supported Audio Formats

- **MP3** (.mp3)
- **MP4** (.mp4)
- **M4A** (.m4a)
- **WAV** (.wav)
- **FLAC** (.flac)
- **OGG** (.ogg)
- **WebM** (.webm)

## Output Files

The application creates three output files in the `./output` directory:

### 1. Transcription File (`transcription_<filename>_<timestamp>.md`)
Contains the full transcription with metadata:
```markdown
# Audio Transcription

**Source File:** meeting.mp3
**Generated:** 2024-01-15T10:30:00.000Z
**Duration:** 5:23

## Transcription

[Full transcribed text here...]
```

### 2. Summary File (`summary_<filename>_<timestamp>.md`)
Contains an intelligent summary of the content:
```markdown
# Audio Summary

**Source File:** meeting.mp3
**Generated:** 2024-01-15T10:30:00.000Z

## Summary

[AI-generated summary here...]
```

### 3. Analysis File (`analysis_<filename>_<timestamp>.json`)
Contains detailed analytics in JSON format:
```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 },
    { "topic": "AI Integration", "mentions": 3 }
  ]
}
```

## Console Output

The application provides real-time feedback and displays results:

```
🚀 Starting Audio Transcription and Analysis...

🎵 Processing audio file: /path/to/audio.mp3
🔄 Transcribing audio file...
✅ Transcription completed successfully!
🔄 Generating summary...
✅ Summary generated successfully!
🔄 Analyzing transcription...
✅ Analysis completed successfully!
📄 Transcription saved to: ./output/transcription_audio_2024-01-15T10-30-00.md
📄 Summary saved to: ./output/summary_audio_2024-01-15T10-30-00.md
📄 Analysis saved to: ./output/analysis_audio_2024-01-15T10-30-00.json

🎉 Audio processing completed successfully!

============================================================
📊 PROCESSING RESULTS
============================================================

📝 SUMMARY:
------------------------------
[Summary content here...]

📈 ANALYSIS:
------------------------------
Word Count: 1280
Speaking Speed: 132 words per minute

🔥 FREQUENTLY MENTIONED TOPICS:
------------------------------
1. Customer Onboarding: 6 mentions
2. Q4 Roadmap: 4 mentions
3. AI Integration: 3 mentions

📁 FILES SAVED:
------------------------------
Transcription: ./output/transcription_audio_2024-01-15T10-30-00.md
Summary: ./output/summary_audio_2024-01-15T10-30-00.md
Analysis: ./output/analysis_audio_2024-01-15T10-30-00.json
============================================================
```

## Error Handling

The application includes comprehensive error handling:

- **Missing API Key**: Clear instructions on how to set up the OpenAI API key
- **File Not Found**: Validates that the audio file exists and is accessible
- **Invalid File Type**: Checks if the path points to a file, not a directory
- **API Errors**: Graceful handling of OpenAI API errors with helpful messages
- **Network Issues**: Timeout and connection error handling

## Development

### Project Structure

```
11/
├── src/
│   ├── index.ts              # Main entry point
│   ├── audioProcessor.ts     # Main orchestrator
│   ├── transcriptionService.ts # OpenAI Whisper integration
│   ├── summaryService.ts     # GPT summary generation
│   ├── analysisService.ts    # Analytics extraction
│   ├── fileService.ts        # File I/O operations
│   └── types.ts              # TypeScript type definitions
├── dist/                     # Compiled JavaScript (generated)
├── output/                   # Generated files (created at runtime)
├── package.json
├── tsconfig.json
├── .env                      # Environment variables (create this)
└── README.md
```

### Development Commands

```bash
# Run in development mode with ts-node
npm run dev /path/to/audio.mp3

# Build the project
npm run build

# Run the built version
npm start /path/to/audio.mp3
```

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)

## API Usage and Costs

This application uses two OpenAI APIs:

1. **Whisper API** (whisper-1 model)
   - Used for audio transcription
   - Pricing: $0.006 per minute

2. **Chat Completions API** (gpt-4.1-mini model)
   - Used for summary generation and topic analysis
   - Pricing: $0.002 per 1K tokens

**Note**: Actual costs depend on the length and complexity of your audio files.

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY environment variable is not set"**
   - Solution: Create a `.env` file with your API key or set it as an environment variable

2. **"Audio file not found"**
   - Solution: Check the file path and ensure the file exists

3. **"Path is not a file"**
   - Solution: Make sure you're pointing to a file, not a directory

4. **API rate limits or errors**
   - Solution: Check your OpenAI API quota and ensure your API key is valid

### Getting Help

If you encounter issues:

1. Check the error messages for specific guidance
2. Verify your OpenAI API key is correct and has sufficient credits
3. Ensure your audio file is in a supported format
4. Check that you have proper file permissions

## License

ISC License

## Contributing

Feel free to submit issues and enhancement requests!