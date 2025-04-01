export {
  validatePath,
  normalizePath,
  joinPaths,
  getRelativePath,
  isPathTraversal,
  sanitizePath,
  getCurrentOS,
} from './lib/pathUtils';

export type {
  ValidationOptions,
  ValidationResult,
  ValidationError,
  ValidationErrorCode,
  NormalizationOptions,
  OSType,
} from './types/path.types';
