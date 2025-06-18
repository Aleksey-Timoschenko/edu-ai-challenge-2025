import { Schema } from './src/schema';

console.log('🚀 TypeScript Schema Validator Examples\n');

// Example 1: Simple user validation
console.log('📝 Example 1: Simple User Validation');
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
console.log('✅ Valid user data:', result);
console.log('');

// Example 2: Invalid user data
console.log('❌ Example 2: Invalid User Data');
const invalidUserData = {
  name: "J", // Too short
  email: "invalid-email", // Invalid email format
  age: 15 // Too young
};

const invalidResult = userSchema.validate(invalidUserData);
console.log('❌ Invalid user data:', invalidResult);
console.log('');

// Example 3: Complex nested validation
console.log('🏗️ Example 3: Complex Nested Validation');
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
console.log('✅ Complex validation result:', complexResult);
console.log('');

// Example 4: Individual validators
console.log('🔧 Example 4: Individual Validators');

// String validation
const stringValidator = Schema.string().min(3).max(10).matches(/^[A-Za-z]+$/);
console.log('String "Hello":', stringValidator.validate('Hello'));
console.log('String "Hi":', stringValidator.validate('Hi')); // Too short
console.log('String "Hello123":', stringValidator.validate('Hello123')); // Invalid pattern

// Number validation
const numberValidator = Schema.number().minimum(0).maximum(100).integer();
console.log('Number 50:', numberValidator.validate(50));
console.log('Number -1:', numberValidator.validate(-1)); // Below minimum
console.log('Number 50.5:', numberValidator.validate(50.5)); // Not integer

// Array validation
const arrayValidator = Schema.array(Schema.string()).min(2).max(4).unique();
console.log('Array ["a", "b"]:', arrayValidator.validate(['a', 'b']));
console.log('Array ["a"]:', arrayValidator.validate(['a'])); // Too few items
console.log('Array ["a", "a"]:', arrayValidator.validate(['a', 'a'])); // Duplicate items

// Date validation
const dateValidator = Schema.date().after(new Date('2020-01-01')).before(new Date('2025-01-01'));
console.log('Date 2024-06-15:', dateValidator.validate(new Date('2024-06-15')));
console.log('Date 2019-01-01:', dateValidator.validate(new Date('2019-01-01'))); // Too early

console.log('\n🎉 All examples completed!');