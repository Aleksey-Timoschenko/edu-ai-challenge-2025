# AI-Powered Product Search Tool

A console-based product search application that uses OpenAI's function calling to understand natural language queries and filter products from a dataset.

## Features

- 🔍 **Natural Language Processing**: Accept queries like "I need a smartphone under $800 with good ratings"
- 🤖 **OpenAI Function Calling**: Uses GPT-4 to extract search criteria from natural language
- 📊 **Structured Results**: Displays filtered products in a clear, organized format
- 🎯 **Dynamic Function Execution**: Calls functions based on OpenAI's response
- 💬 **AI-Generated Summaries**: Provides natural language summaries of search results
- 🖥️ **Interactive Console**: User-friendly command-line interface
- 💾 **File Output**: Automatically saves results to `sample_outputs.md` file

## Prerequisites

- Node.js (v16 or higher)
- OpenAI API key

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OpenAI API key:**
   ```bash
   export OPENAI_API_KEY="your-openai-api-key-here"
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Example Queries

The application can understand various natural language queries:

- **Price-based searches:**
  - "I need electronics under $200"
  - "Show me products under $100"

- **Category-specific searches:**
  - "Find fitness equipment"
  - "Show me kitchen appliances"
  - "I want electronics"

- **Rating-based searches:**
  - "Products with 4.5+ rating"
  - "Highly rated electronics"

- **Stock-based searches:**
  - "Show me items in stock"
  - "Available fitness equipment"

- **Combined queries:**
  - "I need a smartphone under $800 with good ratings"
  - "Show me fitness equipment under $200 that's in stock"
  - "Find books about programming under $50"

## Available Categories

- Electronics
- Fitness
- Kitchen
- Books
- Clothing

## Sample Output

```
🔍 Welcome to the AI-Powered Product Search Tool!
================================================
Available categories: Electronics, Fitness, Kitchen, Books, Clothing
Price range: $9.99 - $1299.99

💡 Examples:
- "I need electronics under $200 with good ratings"
- "Show me fitness equipment in stock"
- "Find books about programming"
- "I want a smartphone under $800"

Enter your search query (or "quit" to exit): I need electronics under $200

🔍 Searching...

📊 Search Results:
==================
Found 4 product(s):

1. Wireless Headphones
   💰 Price: $99.99
   ⭐ Rating: 4.5
   📦 ✅ In Stock
   📂 Category: Electronics

2. Bluetooth Speaker
   💰 Price: $49.99
   ⭐ Rating: 4.4
   📦 ✅ In Stock
   📂 Category: Electronics

3. Gaming Mouse
   💰 Price: $59.99
   ⭐ Rating: 4.3
   📦 ✅ In Stock
   📂 Category: Electronics

4. External Hard Drive
   💰 Price: $89.99
   ⭐ Rating: 4.4
   📦 ✅ In Stock
   📂 Category: Electronics

🔧 Applied Filters: Category: Electronics | Max Price: $200
```

## How It Works

1. **User Input**: User enters a natural language query
2. **Function Calling**: OpenAI extracts search criteria using function calling
3. **Dynamic Execution**: Function is called based on the name from OpenAI's response
4. **AI Summary**: Filtered results are sent back to OpenAI for natural language summary
5. **Results Display**: Products and AI summary are displayed in a structured format

## Technical Details

- **Language**: TypeScript
- **OpenAI Model**: GPT-4
- **Function Calling**: Uses OpenAI's function calling to extract search parameters
- **Dynamic Function Execution**: Calls functions based on OpenAI's response
- **AI Summaries**: Sends results back to OpenAI for natural language summaries
- **Data Source**: Local `products.json` file with 50+ products across 5 categories

## Error Handling

The application includes comprehensive error handling for:
- Missing API key
- OpenAI API errors
- Invalid queries
- Network issues

## Exit the Application

Type `quit` or `exit` to close the application.

## License

MIT

## Output Files

The application automatically saves all search results to `sample_outputs.md` in the project directory. Each search query is appended to the file with:

- **Search query and timestamp**
- **Product details** (name, price, rating, stock status, category)
- **Applied filters** (category, price range, rating, stock status, keywords)
- **AI-generated summary** of the results

The file is never cleared - new results are always appended to the end.