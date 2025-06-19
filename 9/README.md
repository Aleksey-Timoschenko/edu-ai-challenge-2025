# AI Service Analyzer

A lightweight Node.js console application that generates a comprehensive, markdown-formatted report for a service or product from business, technical, and user-focused perspectives using OpenAI API.

## Features
- Accepts either a known service name (e.g., "Spotify") or a raw service description
- Outputs a multi-section markdown report to `sample_outputs.md`
- Uses OpenAI API for analysis and synthesis

## Setup
1. Go to the `9` folder.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the `9` folder with your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage
Run the CLI app from the `9` folder:
```sh
npx ts-node src/index.ts
```
- Choose whether to enter a service name or paste a description.
- The generated report will be appended to `sample_outputs.md` in the `9` folder.

## Output Sections
- Brief History
- Target Audience
- Core Features
- Unique Selling Points
- Business Model
- Tech Stack Insights
- Perceived Strengths
- Perceived Weaknesses