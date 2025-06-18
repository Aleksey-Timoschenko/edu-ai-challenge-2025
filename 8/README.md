# TypeScript Schema Validator

A type-safe, flexible, and easy-to-use schema validation library for TypeScript.

## Features

- 🔒 Type-safe validation with TypeScript
- 🎯 Intuitive fluent API
- 📦 Supports all common data types (string, number, boolean, date, array, object)
- ⚡ Lightweight and zero dependencies
- 🔍 Detailed validation error messages
- 🎨 Customizable error messages
- 🌟 Optional fields support
- 🔄 Nested object validation
- 📝 Comprehensive documentation and examples

## Installation & Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Local Development Setup

1. **Clone or navigate to the project directory:**
   ```bash
   cd 8
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Generate test coverage report:**
   ```bash
   npm run test:coverage
   ```

6. **Run the example:**
   ```bash
   npm run example
   ```

## Usage

### Quick Start

Run the included example to see the library in action:

```bash
npm run example
```

This will demonstrate:
- Simple user validation
- Invalid data handling
- Complex nested validation
- Individual validator examples

### Basic Example

```typescript
import { Schema } from './src/schema';

// Define a schema
const userSchema = Schema.object({
  name: Schema.string().min(2).max(50),
  age: Schema.number().minimum(18).optional(),
  email: Schema.string().matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  tags: Schema.array(Schema.string()).min(1).unique()
});

// Validate data
const result = userSchema.validate({
  name: "John Doe",
  age: 25,
  email: "john@example.com",
  tags: ["developer", "designer"]
});

if (result.isValid) {
  console.log('Valid data:', result.value);
} else {
  console.log('Validation errors:', result.errors);
}
```

### Running Examples

Create a new file `example.ts` in the project root:

```typescript
import { Schema } from './src/schema';

// Example 1: Simple user validation
const userSchema = Schema.object({
  name: Schema.string().min(2).max(50),
  email: Schema.string().matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().minimum(18).optional()
});

const userData = {
  name: "John Doe",
  email: "john@example.com",
  age: 25
};

const result = userSchema.validate(userData);
console.log('User validation result:', result);

// Example 2: Complex nested validation
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().matches(/^\d{5}$/),
  country: Schema.string()
});

const complexUserSchema = Schema.object({
  id: Schema.string().matches(/^[0-9a-f]{8}$/),
  name: Schema.string().min(2).max(50),
  email: Schema.string().matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().minimum(18).maximum(120).optional(),
  birthDate: Schema.date().before(new Date()),
  tags: Schema.array(Schema.string()).min(1).unique(),
  address: addressSchema.optional(),
  settings: Schema.object({
    notifications: Schema.boolean(),
    theme: Schema.string().matches(/^(light|dark)$/)
  })
});

const complexUserData = {
  id: '12345678',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  birthDate: new Date('1994-01-01'),
  tags: ['developer', 'designer'],
  address: {
    street: '123 Main St',
    city: 'New York',
    postalCode: '12345',
    country: 'USA'
  },
  settings: {
    notifications: true,
    theme: 'dark'
  }
};

const complexResult = complexUserSchema.validate(complexUserData);
console.log('Complex validation result:', complexResult);
```

Run the example:
```bash
npx ts-node example.ts
```

### Available Validators

#### String Validator

```typescript
const stringSchema = Schema.string()
  .min(2)           // Minimum length
  .max(50)          // Maximum length
  .matches(/regex/) // Regular expression pattern
  .optional()       // Make the field optional
  .withMessage('Custom error message'); // Custom error message
```

#### Number Validator

```typescript
const numberSchema = Schema.number()
  .minimum(0)     // Minimum value
  .maximum(100)   // Maximum value
  .integer()      // Must be an integer
  .optional();    // Make the field optional
```

#### Boolean Validator

```typescript
const booleanSchema = Schema.boolean()
  .optional()     // Make the field optional
  .withMessage('Must be true or false');
```

#### Date Validator

```typescript
const dateSchema = Schema.date()
  .after(new Date('2024-01-01'))  // Must be after this date
  .before(new Date('2024-12-31')) // Must be before this date
  .optional();
```

#### Array Validator

```typescript
const arraySchema = Schema.array(Schema.string())
  .min(1)        // Minimum items
  .max(10)       // Maximum items
  .unique()      // All items must be unique
  .optional();
```

#### Object Validator

```typescript
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  country: Schema.string()
});

const userSchema = Schema.object({
  name: Schema.string(),
  address: addressSchema.optional()
});
```

### Complex Example

```typescript
const userSchema = Schema.object({
  id: Schema.string().matches(/^[0-9a-f]{8}$/),
  name: Schema.string().min(2).max(50),
  email: Schema.string().matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().minimum(18).maximum(120).optional(),
  birthDate: Schema.date().before(new Date()),
  tags: Schema.array(Schema.string()).min(1).unique(),
  settings: Schema.object({
    notifications: Schema.boolean(),
    theme: Schema.string().matches(/^(light|dark)$/)
  })
});

const validUser = {
  id: '12345678',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  birthDate: new Date('1994-01-01'),
  tags: ['developer', 'designer'],
  settings: {
    notifications: true,
    theme: 'dark'
  }
};

const result = userSchema.validate(validUser);
```

## Error Handling

The validation result includes detailed error messages:

```typescript
const result = userSchema.validate(invalidData);
if (!result.isValid) {
  console.log(result.errors);
  // Example output:
  // [
  //   "name: String must be at least 2 characters long",
  //   "email: String does not match the required pattern",
  //   "age: Value must be at least 18"
  // ]
}
```

## Development

### Project Structure

```
8/
├── src/
│   ├── schema.ts          # Main schema implementation
│   └── schema.test.ts     # Test cases
├── dist/                  # Compiled JavaScript (after build)
├── coverage/              # Test coverage reports
├── example.ts             # Example usage file
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest testing configuration
└── README.md              # This file
```

### Available Scripts

- `npm install` - Install dependencies
- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run example` - Run the example file
- `npm run lint` - Run ESLint (if configured)

### Test Coverage

The project includes comprehensive test coverage:

- **95.55%** statement coverage
- **90%** branch coverage
- **100%** function coverage
- **98.43%** line coverage

Run `npm run test:coverage` to generate the coverage report in `test_report.txt`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT