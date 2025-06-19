import inquirer from 'inquirer';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment.');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const OUTPUT_FILE = 'sample_outputs.md';

const promptTemplate = (input: string, isServiceName: boolean) => `You are an expert analyst. Given the following ${isServiceName ? 'service name' : 'service description'}, generate a comprehensive markdown report with these sections:

- Brief History: Founding year, milestones, etc.
- Target Audience: Primary user segments
- Core Features: Top 2–4 key functionalities
- Unique Selling Points: Key differentiators
- Business Model: How the service makes money
- Tech Stack Insights: Any hints about technologies used
- Perceived Strengths: Mentioned positives or standout features
- Perceived Weaknesses: Cited drawbacks or limitations

Input: ${input}

Return only the markdown report, with clear section headings.`;

function getDivider(input: string) {
  const now = new Date();
  const timestamp = now.toISOString();
  return `\n---\n\n**New Service Analysis** (${timestamp})\n\n_Input:_ ${input}\n\n`;
}

async function main() {
  const { inputType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'inputType',
      message: 'Would you like to analyze a known service name or provide a raw description?',
      choices: [
        { name: 'Known service name (e.g. Spotify, Notion)', value: 'name' },
        { name: 'Raw service/product description', value: 'desc' },
      ],
    },
  ]);

  const { userInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'userInput',
      message: inputType === 'name' ? 'Enter the service name:' : 'Paste the service/product description:',
      validate: (val: string) => val.trim().length > 0 || 'Input cannot be empty',
    },
  ]);

  const prompt = promptTemplate(userInput, inputType === 'name');

  console.log('Generating report...');
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });
    const markdown = completion.choices[0]?.message?.content || '';
    const divider = getDivider(userInput);
    fs.appendFileSync(OUTPUT_FILE, `${divider}${markdown}\n`);
    console.log('Report appended to sample_outputs.md');
  } catch (err) {
    console.error('Error generating report:', err);
  }
}

main();