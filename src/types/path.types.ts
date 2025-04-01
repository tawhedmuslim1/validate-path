/**
 * Supported operating system types for path validation
 */
export type OSType = 'windows' | 'posix' | 'auto';

/**
 * Options for path validation
 */
export interface ValidationOptions {
  /**
   * Target operating system for validation rules
   * @default 'auto'
   */
  os?: OSType;

  /**
   * Whether to allow path traversal (..)
   * @default false
   */
  allowTraversal?: boolean;

  /**
   * Maximum allowed path length
   * @default 260 for Windows, 4096 for POSIX
   */
  maxLength?: number;

  /**
   * Whether to allow absolute paths
   * @default true
   */
  allowAbsolute?: boolean;

  /**
   * Whether to allow relative paths
   * @default true
   */
  allowRelative?: boolean;
}

/**
 * Options for path normalization
 */
export interface NormalizationOptions {
  /**
   * Target operating system for normalization
   * @default 'auto'
   */
  os?: OSType;

  /**
   * Whether to force forward slashes
   * @default true
   */
  forceForwardSlash?: boolean;

  /**
   * Whether to remove trailing slashes
   * @default true
   */
  removeTrailingSlash?: boolean;

  /**
   * Whether to lowercase the path (Windows only)
   * @default true for Windows
   */
  toLowerCase?: boolean;
}

/**
 * Error codes for path validation
 */
export type ValidationErrorCode =
  | 'ILLEGAL_CHAR'
  | 'TOO_LONG'
  | 'TRAVERSAL'
  | 'SYNTAX'
  | 'ABSOLUTE_NOT_ALLOWED'
  | 'RELATIVE_NOT_ALLOWED'
  | 'EMPTY_PATH';

/**
 * Validation error details
 */
export interface ValidationError {
  /**
   * Error code indicating the type of validation failure
   */
  code: ValidationErrorCode;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Position in the path string where the error occurred (if applicable)
   */
  position?: number;
}

/**
 * Result of path validation
 */
export interface ValidationResult {
  /**
   * Whether the path is valid according to the validation options
   */
  isValid: boolean;

  /**
   * Array of validation errors (if any)
   */
  errors?: ValidationError[];

  /**
   * Normalized path (if validation succeeded)
   */
  normalizedPath?: string;
} 