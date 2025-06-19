export interface Product {
  name: string;
  category: string;
  price: number;
  rating: number;
  in_stock: boolean;
}

export interface FilteredProductsResponse {
  products: Product[];
  totalCount: number;
  appliedFilters: {
    category?: string;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    keywords?: string[];
  };
  summary: string;
}

export interface OpenAIToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenAIChoice {
  message: {
    content: string | null;
    tool_calls?: OpenAIToolCall[];
  };
}

export interface OpenAIResponse {
  choices: OpenAIChoice[];
}