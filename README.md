# validate-this-path

A lightweight TypeScript utility package for validating, sanitizing, and manipulating file paths across different operating systems.

[![npm version](https://badge.fury.io/js/validate-this-path.svg)](https://badge.fury.io/js/validate-this-path)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔍 Cross-platform path validation (Windows and POSIX)
- 🧹 Path normalization and sanitization
- 🛡️ Path traversal detection and prevention
- 📝 Comprehensive TypeScript types
- 🪶 Zero dependencies
- ✅ 100% test coverage

## Installation

```bash
npm install validate-this-path
# or
yarn add validate-this-path
# or
pnpm add validate-this-path
```

## Quick Start

```typescript
import { validatePath } from 'validate-this-path';

// Basic path validation
const result = validatePath('path/to/file.txt');
if (result.isValid) {
  console.log('Path is valid:', result.normalizedPath);
} else {
  console.log('Validation errors:', result.errors);
}
```

## Usage Examples

### Path Validation

```typescript
import { validatePath } from 'validate-this-path';

// Windows-specific validation
const windowsResult = validatePath('C:\\Users\\file?.txt', {
  os: 'windows',
  allowTraversal: false,
});
// Result: Invalid (contains illegal character '?')

// POSIX validation with custom options
const posixResult = validatePath('../config/settings.json', {
  os: 'posix',
  allowTraversal: false,
  maxLength: 1000,
  allowAbsolute: false,
});
// Result: Invalid (contains path traversal)

// Auto-detect OS
const autoResult = validatePath('path/to/file.txt');
// Result: Valid, uses current OS rules
```

### Path Normalization

```typescript
import { normalizePath } from 'validate-this-path';

// Basic normalization
normalizePath('path\\to\\file.txt');
// Result: 'path/to/file.txt'

// With options
normalizePath('Path/To/Directory/', {
  os: 'windows',
  forceForwardSlash: true,
  removeTrailingSlash: true,
  toLowerCase: true,
});
// Result: 'path/to/directory'
```

### Path Manipulation

```typescript
import { joinPaths, getRelativePath } from 'validate-this-path';

// Join paths safely
joinPaths('path', 'to', 'file.txt');
// Result: 'path/to/file.txt'

// Get relative path
getRelativePath('/path/to/dir', '/path/file.txt');
// Result: '../../file.txt'
```

### Security Features

```typescript
import { isPathTraversal, sanitizePath } from 'validate-this-path';

// Check for path traversal
isPathTraversal('../config/secret.txt');
// Result: true

// Sanitize user input
sanitizePath('user/<input>:file*.txt', 'windows');
// Result: 'user/inputfile.txt'
```

## API Reference

### validatePath(path: string, options?: ValidationOptions): ValidationResult

Validates a path string against OS-specific rules.

#### Options

```typescript
interface ValidationOptions {
  os?: 'windows' | 'posix' | 'auto'; // Target OS for validation
  allowTraversal?: boolean; // Allow '..' in paths
  maxLength?: number; // Max path length
  allowAbsolute?: boolean; // Allow absolute paths
  allowRelative?: boolean; // Allow relative paths
}
```

#### Result

```typescript
interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  normalizedPath?: string;
}

interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  position?: number;
}

type ValidationErrorCode =
  | 'ILLEGAL_CHAR'
  | 'TOO_LONG'
  | 'TRAVERSAL'
  | 'SYNTAX'
  | 'ABSOLUTE_NOT_ALLOWED'
  | 'RELATIVE_NOT_ALLOWED'
  | 'EMPTY_PATH';
```

### normalizePath(path: string, options?: NormalizationOptions): string

Normalizes a path according to the specified options.

```typescript
interface NormalizationOptions {
  os?: 'windows' | 'posix' | 'auto';
  forceForwardSlash?: boolean;
  removeTrailingSlash?: boolean;
  toLowerCase?: boolean;
}
```

### joinPaths(...paths: string[]): string

Safely joins multiple path segments.

### getRelativePath(from: string, to: string): string

Gets the relative path from one path to another.

### isPathTraversal(path: string): boolean

Checks if a path contains traversal patterns (e.g., '..').

### sanitizePath(path: string, os?: 'windows' | 'posix' | 'auto'): string

Sanitizes a path by removing illegal characters and normalizing it.

## Best Practices

1. **Always validate user input:**

   ```typescript
   const userInput = getUserInput();
   const result = validatePath(userInput, {
     allowTraversal: false,
     allowAbsolute: false,
   });
   ```

2. **Use OS-specific validation when needed:**

   ```typescript
   const result = validatePath(path, {
     os: process.platform === 'win32' ? 'windows' : 'posix',
   });
   ```

3. **Normalize paths before comparison:**

   ```typescript
   const path1 = normalizePath(userPath1);
   const path2 = normalizePath(userPath2);
   const areEqual = path1 === path2;
   ```

4. **Prevent path traversal attacks:**
   ```typescript
   if (isPathTraversal(userPath)) {
     throw new Error('Path traversal not allowed');
   }
   ```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Run formatting
npm run format

# Build the package
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

If you find this package helpful, please consider:

- Starring the repository
- Reporting issues
- Contributing to the codebase
