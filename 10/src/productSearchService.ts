import OpenAI from 'openai';
import { Product, FilteredProductsResponse } from './types';
import productsData from '../products.json';

export class ProductSearchService {
  private openai: OpenAI;
  private products: Product[];

  // Extract tools definition to a constant
  private readonly SEARCH_TOOLS = [
    {
      type: "function" as const,
      function: {
        name: "extractSearchCriteria",
        description: "Extract search criteria from user query",
        parameters: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Product category to filter by",
              enum: ["Electronics", "Fitness", "Kitchen", "Books", "Clothing"]
            },
            maxPrice: {
              type: "number",
              description: "Maximum price filter"
            },
            minRating: {
              type: "number",
              description: "Minimum rating filter (1-5)"
            },
            inStock: {
              type: "boolean",
              description: "Filter by stock availability"
            },
            keywords: {
              type: "array",
              items: { type: "string" },
              description: "Keywords to search in product names"
            }
          }
        }
      }
    }
  ];

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.products = productsData as Product[];
  }

  async searchProducts(userQuery: string): Promise<FilteredProductsResponse> {
    try {
      // Step 1: Use function calling to extract search criteria from natural language
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a product search assistant. Analyze user queries and extract search criteria.
            Available categories: Electronics, Fitness, Kitchen, Books, Clothing.
            Use the extractSearchCriteria function to return the search parameters.`
          },
          {
            role: "user",
            content: userQuery
          }
        ],
        tools: this.SEARCH_TOOLS,
        tool_choice: { type: "function", function: { name: "extractSearchCriteria" } }
      });

      const toolCall = response.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        throw new Error("No tool call received from OpenAI");
      }

      const searchCriteria = JSON.parse(toolCall.function.arguments);

      // Step 2: Dynamically call the function based on the function name from OpenAI
      const functionName = toolCall.function.name;
      const filteredProducts = this.callFunctionByName(functionName, searchCriteria);

      // Step 3: Send the filtered products back to OpenAI for a natural language summary
      const summaryResponse = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that provides natural language summaries of product search results.
            Format the results in a user-friendly way, highlighting key information like prices, ratings, and availability.`
          },
          {
            role: "user",
            content: userQuery
          },
          response.choices[0].message,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              products: filteredProducts,
              totalCount: filteredProducts.length,
              appliedFilters: searchCriteria
            })
          }
        ],
        tools: this.SEARCH_TOOLS
      });

      const summary = summaryResponse.choices[0]?.message?.content || "No summary available.";

      return {
        products: filteredProducts,
        totalCount: filteredProducts.length,
        appliedFilters: searchCriteria,
        summary: summary
      };

    } catch (error) {
      console.error("Error in product search:", error);
      throw error;
    }
  }

  // Dynamic function calling based on function name
  private callFunctionByName(functionName: string, args: any): Product[] {
    switch (functionName) {
      case "extractSearchCriteria":
        return this.executeSearchCriteria(args);
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }

  // This function is called by the function calling system
  private executeSearchCriteria(criteria: any): Product[] {
    return this.products.filter(product => {
      // Category filter
      if (criteria.category && product.category !== criteria.category) {
        return false;
      }

      // Price filter
      if (criteria.maxPrice && product.price > criteria.maxPrice) {
        return false;
      }

      // Rating filter
      if (criteria.minRating && product.rating < criteria.minRating) {
        return false;
      }

      // Stock filter
      if (criteria.inStock !== undefined && product.in_stock !== criteria.inStock) {
        return false;
      }

      // Keywords filter
      if (criteria.keywords && criteria.keywords.length > 0) {
        const productNameLower = product.name.toLowerCase();
        const hasKeyword = criteria.keywords.some((keyword: string) =>
          productNameLower.includes(keyword.toLowerCase())
        );
        if (!hasKeyword) {
          return false;
        }
      }

      return true;
    });
  }

  getAvailableCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
  }

  getPriceRange(): { min: number; max: number } {
    const prices = this.products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
}