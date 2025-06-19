import * as readline from 'readline';
import { ProductSearchService } from './productSearchService';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

class ConsoleProductSearch {
  private rl: readline.Interface;
  private searchService: ProductSearchService;
  private readonly OUTPUT_FILE = 'sample_outputs.md';

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ Error: OPENAI_API_KEY environment variable is required');
      console.log('Please set your OpenAI API key:');
      console.log('export OPENAI_API_KEY="your-api-key-here"');
      console.log('Or create a .env file with: OPENAI_API_KEY=your-api-key-here');
      process.exit(1);
    }

    this.searchService = new ProductSearchService(apiKey);
  }

  async start(): Promise<void> {
    console.log('🔍 Welcome to the AI-Powered Product Search Tool!');
    console.log('================================================');
    console.log('Available categories:', this.searchService.getAvailableCategories().join(', '));
    const priceRange = this.searchService.getPriceRange();
    console.log(`Price range: $${priceRange.min.toFixed(2)} - $${priceRange.max.toFixed(2)}`);
    console.log('');
    console.log('💡 Examples:');
    console.log('- "I need electronics under $200 with good ratings"');
    console.log('- "Show me fitness equipment in stock"');
    console.log('- "Find books about programming"');
    console.log('- "I want a smartphone under $800"');
    console.log('');

    await this.mainLoop();
  }

  private async mainLoop(): Promise<void> {
    while (true) {
      try {
        const query = await this.promptUser('Enter your search query (or "quit" to exit): ');

        if (query.toLowerCase() === 'quit' || query.toLowerCase() === 'exit') {
          console.log('👋 Goodbye!');
          break;
        }

        if (!query.trim()) {
          console.log('Please enter a search query.\n');
          continue;
        }

        console.log('\n🔍 Searching...\n');
        const result = await this.searchService.searchProducts(query);
        this.displayResults(result);
        this.saveResultsToFile(query, result);

      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : 'An unknown error occurred');
        console.log('');
      }
    }

    this.rl.close();
  }

  private promptUser(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  private displayResults(result: any): void {
    console.log('📊 Search Results:');
    console.log('==================');

    if (result.totalCount === 0) {
      console.log('❌ No products found matching your criteria.');
      console.log('');
      return;
    }

    console.log(`Found ${result.totalCount} product(s):\n`);

    result.products.forEach((product: any, index: number) => {
      const stockStatus = product.in_stock ? '✅ In Stock' : '❌ Out of Stock';
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   💰 Price: $${product.price.toFixed(2)}`);
      console.log(`   ⭐ Rating: ${product.rating}/5`);
      console.log(`   📦 ${stockStatus}`);
      console.log(`   📂 Category: ${product.category}`);
      console.log('');
    });

    // Display applied filters
    if (Object.keys(result.appliedFilters).length > 0) {
      console.log('🔧 Applied Filters:');
      const filters = [];
      if (result.appliedFilters.category) filters.push(`Category: ${result.appliedFilters.category}`);
      if (result.appliedFilters.maxPrice) filters.push(`Max Price: $${result.appliedFilters.maxPrice}`);
      if (result.appliedFilters.minRating) filters.push(`Min Rating: ${result.appliedFilters.minRating}`);
      if (result.appliedFilters.inStock !== undefined) filters.push(`In Stock: ${result.appliedFilters.inStock}`);
      if (result.appliedFilters.keywords?.length) filters.push(`Keywords: ${result.appliedFilters.keywords.join(', ')}`);

      console.log(filters.join(' | '));
      console.log('');
    }

    // Display AI-generated summary
    if (result.summary) {
      console.log('🤖 AI Summary:');
      console.log('==============');
      console.log(result.summary);
      console.log('');
    }
  }

  private saveResultsToFile(query: string, result: any): void {
    try {
      const timestamp = new Date().toISOString();
      const divider = '\n' + '='.repeat(80) + '\n';

      let output = `\n## Search Query: "${query}"\n`;
      output += `**Timestamp:** ${timestamp}\n\n`;

      if (result.totalCount === 0) {
        output += '❌ **No products found matching your criteria.**\n\n';
      } else {
        output += `📊 **Found ${result.totalCount} product(s):**\n\n`;

        result.products.forEach((product: any, index: number) => {
          const stockStatus = product.in_stock ? '✅ In Stock' : '❌ Out of Stock';
          output += `### ${index + 1}. ${product.name}\n`;
          output += `- **Price:** $${product.price.toFixed(2)}\n`;
          output += `- **Rating:** ${product.rating}/5\n`;
          output += `- **Status:** ${stockStatus}\n`;
          output += `- **Category:** ${product.category}\n\n`;
        });

        // Add applied filters
        if (Object.keys(result.appliedFilters).length > 0) {
          output += '🔧 **Applied Filters:**\n';
          const filters = [];
          if (result.appliedFilters.category) filters.push(`Category: ${result.appliedFilters.category}`);
          if (result.appliedFilters.maxPrice) filters.push(`Max Price: $${result.appliedFilters.maxPrice}`);
          if (result.appliedFilters.minRating) filters.push(`Min Rating: ${result.appliedFilters.minRating}`);
          if (result.appliedFilters.inStock !== undefined) filters.push(`In Stock: ${result.appliedFilters.inStock}`);
          if (result.appliedFilters.keywords?.length) filters.push(`Keywords: ${result.appliedFilters.keywords.join(', ')}`);

          output += filters.join(' | ') + '\n\n';
        }

        // Add AI summary
        if (result.summary) {
          output += '🤖 **AI Summary:**\n';
          output += result.summary + '\n\n';
        }
      }

      output += divider;

      // Append to file (create if doesn't exist)
      fs.appendFileSync(this.OUTPUT_FILE, output);
      console.log(`💾 Results saved to ${this.OUTPUT_FILE}\n`);

    } catch (error) {
      console.error('❌ Error saving results to file:', error);
    }
  }
}

// Start the application
const app = new ConsoleProductSearch();
app.start().catch(console.error);