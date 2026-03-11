/**
 * Validation Service
 *
 * Handles input validation utilities for user data, passwords, and other form inputs.
 * Follows Single Responsibility Principle - only handles validation concerns.
 */
export class ValidationService {

  /**
   * Validate email format
   * @param email - Email string to validate
   * @returns boolean
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param password - Password string to validate
   * @returns boolean
   */
  static isValidPassword(password: string): boolean {
    // At least 6 characters (matching backend validation)
    return password.length >= 6;
  }

  /**
   * Validate username format
   * @param username - Username string to validate
   * @returns boolean
   */
  static isValidUsername(username: string): boolean {
    // Username should be 3-30 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  }

  /**
   * Validate that password and confirmation match
   * @param password - Original password
   * @param confirmPassword - Confirmation password
   * @returns boolean
   */
  static isPasswordMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }

  /**
   * Validate required field is not empty
   * @param value - Value to check
   * @returns boolean
   */
  static isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
  }

  /**
   * Get comprehensive validation result for user registration
   * @param data - Registration data to validate
   * @returns ValidationResult object with errors
   */
  static validateRegistrationData(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): ValidationResult {
    const errors: string[] = [];

    if (!this.isNotEmpty(data.username)) {
      errors.push('Username is required');
    } else if (!this.isValidUsername(data.username)) {
      errors.push('Username must be 3-30 characters and contain only letters, numbers, and underscores');
    }

    if (!this.isNotEmpty(data.email)) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!this.isNotEmpty(data.password)) {
      errors.push('Password is required');
    } else if (!this.isValidPassword(data.password)) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!this.isNotEmpty(data.confirmPassword)) {
      errors.push('Please confirm your password');
    } else if (!this.isPasswordMatch(data.password, data.confirmPassword)) {
      errors.push('Passwords do not match');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get comprehensive validation result for user login
   * @param data - Login data to validate
   * @returns ValidationResult object with errors
   */
  static validateLoginData(data: {
    username: string;
    password: string;
  }): ValidationResult {
    const errors: string[] = [];

    if (!this.isNotEmpty(data.username)) {
      errors.push('Username is required');
    }

    if (!this.isNotEmpty(data.password)) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}