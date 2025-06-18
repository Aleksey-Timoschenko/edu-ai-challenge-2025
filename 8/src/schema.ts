/**
 * Represents the result of a validation operation
 */
export interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  errors?: string[];
}

/**
 * Base validator interface that all validators must implement
 */
export interface Validator<T> {
  validate(value: unknown): ValidationResult<T>;
}

/**
 * Base class for all validators with common functionality
 */
abstract class BaseValidator<T> implements Validator<T> {
  protected message?: string;
  protected isOptional: boolean = false;

  /**
   * Sets a custom error message for the validator
   * @param message - The custom error message
   */
  withMessage(message: string): this {
    this.message = message;
    return this;
  }

  /**
   * Makes the field optional
   */
  optional(): this {
    this.isOptional = true;
    return this;
  }

  abstract validate(value: unknown): ValidationResult<T>;

  protected createError(defaultMessage: string): ValidationResult<T> {
    return {
      isValid: false,
      errors: [this.message || defaultMessage]
    };
  }

  protected handleOptional(value: unknown): ValidationResult<T> | null {
    if (value === undefined || value === null) {
      return this.isOptional ? { isValid: true, value: undefined } : null;
    }
    return null;
  }
}

/**
 * String validator with various validation rules
 */
export class StringValidator extends BaseValidator<string> {
  private minLength?: number;
  private maxLength?: number;
  private pattern?: RegExp;

  /**
   * Sets minimum length requirement
   */
  min(length: number): this {
    this.minLength = length;
    return this;
  }

  /**
   * Sets maximum length requirement
   */
  max(length: number): this {
    this.maxLength = length;
    return this;
  }

  /**
   * Sets a regex pattern requirement
   */
  matches(pattern: RegExp): this {
    this.pattern = pattern;
    return this;
  }

  validate(value: unknown): ValidationResult<string> {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    if (typeof value !== 'string') {
      return this.createError('Value must be a string');
    }

    if (this.minLength !== undefined && value.length < this.minLength) {
      return this.createError(`String must be at least ${this.minLength} characters long`);
    }

    if (this.maxLength !== undefined && value.length > this.maxLength) {
      return this.createError(`String must be at most ${this.maxLength} characters long`);
    }

    if (this.pattern && !this.pattern.test(value)) {
      return this.createError('String does not match the required pattern');
    }

    return { isValid: true, value };
  }
}

/**
 * Number validator with various validation rules
 */
export class NumberValidator extends BaseValidator<number> {
  private min?: number;
  private max?: number;
  private isInteger: boolean = false;

  /**
   * Sets minimum value requirement
   */
  minimum(value: number): this {
    this.min = value;
    return this;
  }

  /**
   * Sets maximum value requirement
   */
  maximum(value: number): this {
    this.max = value;
    return this;
  }

  /**
   * Requires the number to be an integer
   */
  integer(): this {
    this.isInteger = true;
    return this;
  }

  validate(value: unknown): ValidationResult<number> {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    if (typeof value !== 'number' || isNaN(value)) {
      return this.createError('Value must be a number');
    }

    if (this.isInteger && !Number.isInteger(value)) {
      return this.createError('Value must be an integer');
    }

    if (this.min !== undefined && value < this.min) {
      return this.createError(`Value must be at least ${this.min}`);
    }

    if (this.max !== undefined && value > this.max) {
      return this.createError(`Value must be at most ${this.max}`);
    }

    return { isValid: true, value };
  }
}

/**
 * Boolean validator
 */
export class BooleanValidator extends BaseValidator<boolean> {
  validate(value: unknown): ValidationResult<boolean> {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    if (typeof value !== 'boolean') {
      return this.createError('Value must be a boolean');
    }

    return { isValid: true, value };
  }
}

/**
 * Date validator with various validation rules
 */
export class DateValidator extends BaseValidator<Date> {
  private minDate?: Date;
  private maxDate?: Date;

  /**
   * Sets minimum date requirement
   */
  after(date: Date): this {
    this.minDate = date;
    return this;
  }

  /**
   * Sets maximum date requirement
   */
  before(date: Date): this {
    this.maxDate = date;
    return this;
  }

  validate(value: unknown): ValidationResult<Date> {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
      if (isNaN(date.getTime())) {
        return this.createError('Invalid date format');
      }
    } else {
      return this.createError('Value must be a valid date');
    }

    if (this.minDate && date < this.minDate) {
      return this.createError(`Date must be after ${this.minDate.toISOString()}`);
    }

    if (this.maxDate && date > this.maxDate) {
      return this.createError(`Date must be before ${this.maxDate.toISOString()}`);
    }

    return { isValid: true, value: date };
  }
}

/**
 * Array validator with type-safe item validation
 */
export class ArrayValidator<T> extends BaseValidator<T[]> {
  private minItems?: number;
  private maxItems?: number;
  private uniqueItems: boolean = false;

  constructor(private itemValidator: Validator<T>) {
    super();
  }

  /**
   * Sets minimum items requirement
   */
  min(count: number): this {
    this.minItems = count;
    return this;
  }

  /**
   * Sets maximum items requirement
   */
  max(count: number): this {
    this.maxItems = count;
    return this;
  }

  /**
   * Requires all items to be unique
   */
  unique(): this {
    this.uniqueItems = true;
    return this;
  }

  validate(value: unknown): ValidationResult<T[]> {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    if (!Array.isArray(value)) {
      return this.createError('Value must be an array');
    }

    if (this.minItems !== undefined && value.length < this.minItems) {
      return this.createError(`Array must contain at least ${this.minItems} items`);
    }

    if (this.maxItems !== undefined && value.length > this.maxItems) {
      return this.createError(`Array must contain at most ${this.maxItems} items`);
    }

    const validatedItems: T[] = [];
    const errors: string[] = [];

    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i]);
      if (!itemResult.isValid) {
        errors.push(`Item at index ${i}: ${itemResult.errors?.[0]}`);
      } else if (itemResult.value !== undefined) {
        validatedItems.push(itemResult.value);
      }
    }

    if (this.uniqueItems && new Set(validatedItems).size !== validatedItems.length) {
      errors.push('Array must contain unique items');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, value: validatedItems };
  }
}

/**
 * Object validator with type-safe property validation
 */
export class ObjectValidator<T> extends BaseValidator<T> {
  constructor(private schema: Record<string, Validator<any>>) {
    super();
  }

  validate(value: unknown): ValidationResult<T> {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    if (typeof value !== 'object' || value === null) {
      return this.createError('Value must be an object');
    }

    const errors: string[] = [];
    const validatedObject: any = {};

    for (const [key, validator] of Object.entries(this.schema)) {
      const propertyValue = (value as any)[key];
      const result = validator.validate(propertyValue);

      if (!result.isValid) {
        errors.push(`${key}: ${result.errors?.[0]}`);
      } else if (result.value !== undefined) {
        validatedObject[key] = result.value;
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, value: validatedObject as T };
  }
}

/**
 * Schema builder class for creating type-safe validators
 * @example
 * ```typescript
 * const userSchema = Schema.object({
 *   name: Schema.string().min(2).max(50),
 *   age: Schema.number().minimum(18).optional(),
 *   email: Schema.string().matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
 *   tags: Schema.array(Schema.string()).min(1).unique()
 * });
 *
 * const result = userSchema.validate({
 *   name: "John Doe",
 *   age: 25,
 *   email: "john@example.com",
 *   tags: ["developer", "designer"]
 * });
 * ```
 */
export class Schema {
  /**
   * Creates a string validator
   */
  static string(): StringValidator {
    return new StringValidator();
  }

  /**
   * Creates a number validator
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }

  /**
   * Creates a boolean validator
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  /**
   * Creates a date validator
   */
  static date(): DateValidator {
    return new DateValidator();
  }

  /**
   * Creates an array validator
   */
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }

  /**
   * Creates an object validator
   */
  static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }
}