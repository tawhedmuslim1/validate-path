import * as path from 'path';
import { platform } from 'os';
import {
  ValidationOptions,
  ValidationResult,
  ValidationError,
  NormalizationOptions,
  OSType,
  ValidationErrorCode,
} from '../types/path.types';

// Constants
const WINDOWS_MAX_PATH = 260;
const POSIX_MAX_PATH = 4096;
const WINDOWS_ILLEGAL_CHARS = /[<>:"|?*\x00-\x1F]/g;
const POSIX_ILLEGAL_CHARS = /\x00/g;

/**
 * Determines the current operating system type
 */
export function getCurrentOS(): OSType {
  return platform() === 'win32' ? 'windows' : 'posix';
}

/**
 * Gets the maximum path length for the specified OS
 */
function getMaxPathLength(os: OSType): number {
  return os === 'windows' ? WINDOWS_MAX_PATH : POSIX_MAX_PATH;
}

/**
 * Validates a path string against OS-specific rules
 * @param pathStr - The path to validate
 * @param options - Validation options
 */
export function validatePath(pathStr: string, options: ValidationOptions = {}): ValidationResult {
  const errors: ValidationError[] = [];
  const os = options.os === 'auto' || !options.os ? getCurrentOS() : options.os;
  const maxLength = options.maxLength || getMaxPathLength(os);
  const allowTraversal = options.allowTraversal ?? false;
  const allowAbsolute = options.allowAbsolute ?? true;
  const allowRelative = options.allowRelative ?? true;

  // Check for empty path
  if (!pathStr) {
    return {
      isValid: false,
      errors: [
        {
          code: 'EMPTY_PATH',
          message: 'Path cannot be empty',
        },
      ],
    };
  }

  // Check path length
  if (pathStr.length > maxLength) {
    errors.push({
      code: 'TOO_LONG',
      message: `Path exceeds maximum length of ${maxLength} characters`,
    });
  }

  // Check for illegal characters
  const illegalChars = os === 'windows' ? WINDOWS_ILLEGAL_CHARS : POSIX_ILLEGAL_CHARS;
  const illegalMatch = pathStr.match(illegalChars);
  if (illegalMatch) {
    errors.push({
      code: 'ILLEGAL_CHAR',
      message: `Path contains illegal character: ${illegalMatch[0]}`,
      position: illegalMatch.index,
    });
  }

  // Check for path traversal
  if (!allowTraversal && pathStr.includes('..')) {
    errors.push({
      code: 'TRAVERSAL',
      message: 'Path traversal (..) is not allowed',
    });
  }

  // Check absolute/relative path restrictions
  const isAbsolute = path.isAbsolute(pathStr);
  if (isAbsolute && !allowAbsolute) {
    errors.push({
      code: 'ABSOLUTE_NOT_ALLOWED',
      message: 'Absolute paths are not allowed',
    });
  }
  if (!isAbsolute && !allowRelative) {
    errors.push({
      code: 'RELATIVE_NOT_ALLOWED',
      message: 'Relative paths are not allowed',
    });
  }

  // Return validation result
  if (errors.length === 0) {
    return {
      isValid: true,
      normalizedPath: normalizePath(pathStr, { os }),
    };
  }

  return {
    isValid: false,
    errors,
  };
}

/**
 * Normalizes a path according to the specified options
 * @param pathStr - The path to normalize
 * @param options - Normalization options
 */
export function normalizePath(pathStr: string, options: NormalizationOptions = {}): string {
  // Handle empty path
  if (!pathStr) {
    return '';
  }

  const os = options.os === 'auto' || !options.os ? getCurrentOS() : options.os;
  const forceForwardSlash = options.forceForwardSlash ?? true;
  const removeTrailingSlash = options.removeTrailingSlash ?? true;
  const toLowerCase = options.toLowerCase ?? os === 'windows';

  // Normalize path separators
  let normalized = path.normalize(pathStr);

  // Handle '.' case from path.normalize
  if (normalized === '.') {
    return pathStr;
  }

  // Force forward slashes if requested
  if (forceForwardSlash) {
    normalized = normalized.replace(/\\/g, '/');
  }

  // Remove trailing slash if requested
  if (removeTrailingSlash && normalized.length > 1) {
    normalized = normalized.replace(/[/\\]$/, '');
  }

  // Convert to lowercase for Windows
  if (toLowerCase) {
    normalized = normalized.toLowerCase();
  }

  return normalized;
}

/**
 * Safely joins path segments
 * @param paths - Path segments to join
 */
export function joinPaths(...paths: string[]): string {
  return path.join(...paths);
}

/**
 * Gets a relative path from one path to another
 * @param from - Source path
 * @param to - Target path
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

/**
 * Checks if a path contains traversal
 * @param pathStr - The path to check
 */
export function isPathTraversal(pathStr: string): boolean {
  if (!pathStr) {
    return false;
  }
  const normalized = normalizePath(pathStr);
  return normalized.includes('..');
}

/**
 * Sanitizes a path by removing illegal characters and normalizing it
 * @param pathStr - The path to sanitize
 * @param os - Target operating system
 */
export function sanitizePath(pathStr: string, os: OSType = getCurrentOS()): string {
  // Handle empty path
  if (!pathStr) {
    return '';
  }

  // Remove illegal characters based on OS
  const illegalChars = os === 'windows' ? WINDOWS_ILLEGAL_CHARS : POSIX_ILLEGAL_CHARS;
  const sanitized = pathStr.replace(illegalChars, '');

  // Normalize the sanitized path
  return normalizePath(sanitized, { os });
}
