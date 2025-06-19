// Example usage script to demonstrate the product filtering logic
// This doesn't require OpenAI API access and shows how the filtering works

const products = require('./products.json');

// Example search criteria that would be extracted by OpenAI function calling
const exampleSearches = [
  {
    query: "I need electronics under $200",
    criteria: { category: "Electronics", maxPrice: 200 }
  },
  {
    query: "Show me fitness equipment in stock",
    criteria: { category: "Fitness", inStock: true }
  },
  {
    query: "Find books about programming",
    criteria: { category: "Books", keywords: ["programming"] }
  },
  {
    query: "I want a smartphone under $800",
    criteria: { category: "Electronics", maxPrice: 800, keywords: ["smartphone"] }
  }
];

function filterProducts(criteria) {
  return products.filter(product => {
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
      const hasKeyword = criteria.keywords.some(keyword =>
        productNameLower.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }

    return true;
  });
}

function displayResults(query, criteria, results) {
  console.log(`\n🔍 Query: "${query}"`);
  console.log('📊 Search Results:');
  console.log('==================');

  if (results.length === 0) {
    console.log('❌ No products found matching your criteria.\n');
    return;
  }

  console.log(`Found ${results.length} product(s):\n`);

  results.forEach((product, index) => {
    const stockStatus = product.in_stock ? '✅ In Stock' : '❌ Out of Stock';
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   💰 Price: $${product.price.toFixed(2)}`);
    console.log(`   ⭐ Rating: ${product.rating}/5`);
    console.log(`   📦 ${stockStatus}`);
    console.log(`   📂 Category: ${product.category}`);
    console.log('');
  });

  // Display applied filters
  console.log('🔧 Applied Filters:');
  const filters = [];
  if (criteria.category) filters.push(`Category: ${criteria.category}`);
  if (criteria.maxPrice) filters.push(`Max Price: $${criteria.maxPrice}`);
  if (criteria.minRating) filters.push(`Min Rating: ${criteria.minRating}`);
  if (criteria.inStock !== undefined) filters.push(`In Stock: ${criteria.inStock}`);
  if (criteria.keywords?.length) filters.push(`Keywords: ${criteria.keywords.join(', ')}`);

  console.log(filters.join(' | '));
  console.log('');
}

console.log('🚀 Example Product Search Demonstrations');
console.log('========================================\n');

exampleSearches.forEach(({ query, criteria }) => {
  const results = filterProducts(criteria);
  displayResults(query, criteria, results);
});

console.log('💡 This demonstrates how the OpenAI function calling would extract search criteria');
console.log('   from natural language queries and filter the product dataset accordingly.');