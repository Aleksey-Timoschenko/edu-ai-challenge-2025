import { Schema } from './schema';

describe('Schema Validator', () => {
  describe('StringValidator', () => {
    it('should validate basic strings', () => {
      const validator = Schema.string();
      expect(validator.validate('hello').isValid).toBe(true);
      expect(validator.validate(123).isValid).toBe(false);
    });

    it('should validate string length', () => {
      const validator = Schema.string().min(2).max(5);
      expect(validator.validate('hi').isValid).toBe(true);
      expect(validator.validate('hello').isValid).toBe(true);
      expect(validator.validate('h').isValid).toBe(false);
      expect(validator.validate('hello world').isValid).toBe(false);
    });

    it('should validate regex patterns', () => {
      const validator = Schema.string().matches(/^[A-Z][a-z]+$/);
      expect(validator.validate('Hello').isValid).toBe(true);
      expect(validator.validate('hello').isValid).toBe(false);
      expect(validator.validate('HELLO').isValid).toBe(false);
    });

    it('should handle optional values', () => {
      const validator = Schema.string().optional();
      expect(validator.validate(undefined).isValid).toBe(true);
      expect(validator.validate(null).isValid).toBe(true);
      expect(validator.validate('hello').isValid).toBe(true);
    });

    it('should use custom error messages', () => {
      const validator = Schema.string().withMessage('Custom error');
      const result = validator.validate(123);
      expect(result.isValid).toBe(false);
      expect(result.errors?.[0]).toBe('Custom error');
    });
  });

  describe('NumberValidator', () => {
    it('should validate basic numbers', () => {
      const validator = Schema.number();
      expect(validator.validate(123).isValid).toBe(true);
      expect(validator.validate('123').isValid).toBe(false);
    });

    it('should validate number range', () => {
      const validator = Schema.number().minimum(0).maximum(100);
      expect(validator.validate(50).isValid).toBe(true);
      expect(validator.validate(-1).isValid).toBe(false);
      expect(validator.validate(101).isValid).toBe(false);
    });

    it('should validate integers', () => {
      const validator = Schema.number().integer();
      expect(validator.validate(123).isValid).toBe(true);
      expect(validator.validate(123.45).isValid).toBe(false);
    });
  });

  describe('BooleanValidator', () => {
    it('should validate booleans', () => {
      const validator = Schema.boolean();
      expect(validator.validate(true).isValid).toBe(true);
      expect(validator.validate(false).isValid).toBe(true);
      expect(validator.validate('true').isValid).toBe(false);
      expect(validator.validate(1).isValid).toBe(false);
    });
  });

  describe('DateValidator', () => {
    it('should validate dates', () => {
      const validator = Schema.date();
      expect(validator.validate(new Date()).isValid).toBe(true);
      expect(validator.validate('2024-02-24').isValid).toBe(true);
      expect(validator.validate('invalid date').isValid).toBe(false);
    });

    it('should validate date range', () => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-12-31');
      const validator = Schema.date().after(minDate).before(maxDate);

      expect(validator.validate(new Date('2024-06-15')).isValid).toBe(true);
      expect(validator.validate(new Date('2023-12-31')).isValid).toBe(false);
      expect(validator.validate(new Date('2025-01-01')).isValid).toBe(false);
    });
  });

  describe('ArrayValidator', () => {
    it('should validate arrays', () => {
      const validator = Schema.array(Schema.string());
      expect(validator.validate(['a', 'b', 'c']).isValid).toBe(true);
      expect(validator.validate([1, 2, 3]).isValid).toBe(false);
      expect(validator.validate('not an array').isValid).toBe(false);
    });

    it('should validate array length', () => {
      const validator = Schema.array(Schema.number()).min(2).max(4);
      expect(validator.validate([1, 2]).isValid).toBe(true);
      expect(validator.validate([1, 2, 3, 4]).isValid).toBe(true);
      expect(validator.validate([1]).isValid).toBe(false);
      expect(validator.validate([1, 2, 3, 4, 5]).isValid).toBe(false);
    });

    it('should validate unique items', () => {
      const validator = Schema.array(Schema.string()).unique();
      expect(validator.validate(['a', 'b', 'c']).isValid).toBe(true);
      expect(validator.validate(['a', 'b', 'a']).isValid).toBe(false);
    });
  });

  describe('ObjectValidator', () => {
    it('should validate objects', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number(),
        isActive: Schema.boolean()
      });

      expect(validator.validate({
        name: 'John',
        age: 30,
        isActive: true
      }).isValid).toBe(true);

      expect(validator.validate({
        name: 'John',
        age: '30',
        isActive: true
      }).isValid).toBe(false);
    });

    it('should validate nested objects', () => {
      const addressSchema = Schema.object({
        street: Schema.string(),
        city: Schema.string(),
        country: Schema.string()
      });

      const userSchema = Schema.object({
        name: Schema.string(),
        address: addressSchema
      });

      expect(userSchema.validate({
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA'
        }
      }).isValid).toBe(true);

      expect(userSchema.validate({
        name: 'John',
        address: {
          street: '123 Main St',
          city: 123,
          country: 'USA'
        }
      }).isValid).toBe(false);
    });

    it('should handle optional fields', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number().optional()
      });

      expect(validator.validate({
        name: 'John'
      }).isValid).toBe(true);

      expect(validator.validate({
        name: 'John',
        age: 30
      }).isValid).toBe(true);

      expect(validator.validate({
        age: 30
      }).isValid).toBe(false);
    });
  });

  describe('Complex Schema Example', () => {
    it('should validate a complex user schema', () => {
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
      expect(result.isValid).toBe(true);
      expect(result.value).toBeDefined();

      const invalidUser = {
        id: '123', // invalid id format
        name: 'J', // too short
        email: 'invalid-email',
        age: 15, // too young
        birthDate: new Date('2025-01-01'), // future date
        tags: ['developer', 'developer'], // duplicate tags
        settings: {
          notifications: true,
          theme: 'invalid' // invalid theme
        }
      };

      const invalidResult = userSchema.validate(invalidUser);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors?.length).toBeGreaterThan(0);
    });
  });
});