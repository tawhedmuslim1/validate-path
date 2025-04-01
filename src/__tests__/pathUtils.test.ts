import {
  validatePath,
  normalizePath,
  joinPaths,
  getRelativePath,
  isPathTraversal,
  sanitizePath,
  getCurrentOS,
  ValidationOptions,
  NormalizationOptions,
  OSType,
} from '..';

describe('Path Utilities', () => {
  describe('validatePath', () => {
    it('should validate a simple valid path', () => {
      const result = validatePath('path/to/file.txt');
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect illegal characters in Windows paths', () => {
      const result = validatePath('path/to/file?.txt', { os: 'windows' });
      expect(result.isValid).toBe(false);
      expect(result.errors?.[0].code).toBe('ILLEGAL_CHAR');
    });

    it('should detect path traversal when not allowed', () => {
      const result = validatePath('../path/to/file.txt');
      expect(result.isValid).toBe(false);
      expect(result.errors?.[0].code).toBe('TRAVERSAL');
    });

    it('should allow path traversal when explicitly enabled', () => {
      const result = validatePath('../path/to/file.txt', { allowTraversal: true });
      expect(result.isValid).toBe(true);
    });

    it('should detect paths that are too long', () => {
      const longPath = 'a'.repeat(300);
      const result = validatePath(longPath, { os: 'windows', maxLength: 260 });
      expect(result.isValid).toBe(false);
      expect(result.errors?.[0].code).toBe('TOO_LONG');
    });

    it('should handle empty paths', () => {
      const result = validatePath('');
      expect(result.isValid).toBe(false);
      expect(result.errors?.[0].code).toBe('EMPTY_PATH');
    });

    it('should validate absolute paths when not allowed', () => {
      const result = validatePath('/absolute/path', { allowAbsolute: false });
      expect(result.isValid).toBe(false);
      expect(result.errors?.[0].code).toBe('ABSOLUTE_NOT_ALLOWED');
    });

    it('should validate relative paths when not allowed', () => {
      const result = validatePath('relative/path', { allowRelative: false });
      expect(result.isValid).toBe(false);
      expect(result.errors?.[0].code).toBe('RELATIVE_NOT_ALLOWED');
    });

    it('should use default maxLength based on OS', () => {
      const longWindowsPath = 'a'.repeat(261);
      const longPosixPath = 'a'.repeat(4097);

      const windowsResult = validatePath(longWindowsPath, { os: 'windows' });
      const posixResult = validatePath(longPosixPath, { os: 'posix' });

      expect(windowsResult.isValid).toBe(false);
      expect(windowsResult.errors?.[0].code).toBe('TOO_LONG');
      expect(posixResult.isValid).toBe(false);
      expect(posixResult.errors?.[0].code).toBe('TOO_LONG');
    });

    it('should handle multiple validation errors', () => {
      const result = validatePath('../path/to/file?.txt', {
        os: 'windows',
        allowTraversal: false,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(1);
      expect(result.errors?.map((e) => e.code)).toContain('TRAVERSAL');
      expect(result.errors?.map((e) => e.code)).toContain('ILLEGAL_CHAR');
    });
  });

  describe('normalizePath', () => {
    it('should normalize path separators', () => {
      const result = normalizePath('path\\to\\file.txt');
      expect(result).toBe('path/to/file.txt');
    });

    it('should handle trailing slashes according to options', () => {
      const withSlash = normalizePath('path/to/dir/', { removeTrailingSlash: false });
      const withoutSlash = normalizePath('path/to/dir/', { removeTrailingSlash: true });
      expect(withSlash).toBe('path/to/dir/');
      expect(withoutSlash).toBe('path/to/dir');
    });

    it('should handle case sensitivity according to OS', () => {
      const windowsPath = normalizePath('Path/To/File.txt', { os: 'windows' });
      const posixPath = normalizePath('Path/To/File.txt', { os: 'posix' });
      expect(windowsPath).toBe('path/to/file.txt');
      expect(posixPath).toBe('Path/To/File.txt');
    });

    it('should handle auto OS detection', () => {
      const result = normalizePath('Path/To/File.txt', { os: 'auto' });
      const expected = getCurrentOS() === 'windows' ? 'path/to/file.txt' : 'Path/To/File.txt';
      expect(result).toBe(expected);
    });

    it('should handle empty paths', () => {
      const result = normalizePath('');
      expect(result).toBe('');
    });

    it('should respect toLowerCase option', () => {
      const withLowerCase = normalizePath('Path/To/File.txt', { toLowerCase: true });
      const withoutLowerCase = normalizePath('Path/To/File.txt', { toLowerCase: false });
      expect(withLowerCase).toBe('path/to/file.txt');
      expect(withoutLowerCase).toBe('Path/To/File.txt');
    });

    it('should handle current directory', () => {
      const result = normalizePath('.');
      expect(result).toBe('.');
    });

    it('should handle all default options', () => {
      const result = normalizePath('Path\\To\\File.txt');
      const expected = getCurrentOS() === 'windows' ? 'path/to/file.txt' : 'Path/to/file.txt';
      expect(result).toBe(expected);
    });
  });

  describe('joinPaths', () => {
    it('should join path segments correctly', () => {
      const result = joinPaths('path', 'to', 'file.txt');
      expect(result).toMatch(/^path[/\\]to[/\\]file\.txt$/);
    });

    it('should handle empty segments', () => {
      const result = joinPaths('path', '', 'file.txt');
      expect(result).toMatch(/^path[/\\]file\.txt$/);
    });

    it('should handle no segments', () => {
      const result = joinPaths();
      expect(result).toBe('.');
    });

    it('should handle single segment', () => {
      const result = joinPaths('path');
      expect(result).toBe('path');
    });
  });

  describe('getRelativePath', () => {
    it('should calculate relative path correctly', () => {
      const result = getRelativePath('/path/to', '/path/to/file.txt');
      expect(result).toBe('file.txt');
    });

    it('should handle parent directory traversal', () => {
      const result = normalizePath(getRelativePath('/path/to/dir', '/path/file.txt'));
      expect(result).toBe('../../file.txt');
    });

    it('should handle same paths', () => {
      const result = getRelativePath('/path/to', '/path/to');
      expect(result).toBe('');
    });

    it('should handle current directory', () => {
      const result = getRelativePath('.', 'file.txt');
      expect(result).toBe('file.txt');
    });
  });

  describe('isPathTraversal', () => {
    it('should detect path traversal', () => {
      expect(isPathTraversal('../file.txt')).toBe(true);
      expect(isPathTraversal('path/to/file.txt')).toBe(false);
    });

    it('should handle normalized paths', () => {
      expect(isPathTraversal('path/../../file.txt')).toBe(true);
    });

    it('should handle empty paths', () => {
      expect(isPathTraversal('')).toBe(false);
    });

    it('should handle complex traversal patterns', () => {
      expect(isPathTraversal('path/./to/../../../file.txt')).toBe(true);
      expect(isPathTraversal('./path/to/file.txt')).toBe(false);
    });
  });

  describe('sanitizePath', () => {
    it('should remove illegal characters', () => {
      const result = sanitizePath('path/to/file?.txt', 'windows');
      expect(result).toBe('path/to/file.txt');
    });

    it('should normalize the path after sanitization', () => {
      const result = sanitizePath('path\\to\\file?.txt', 'windows');
      expect(result).toBe('path/to/file.txt');
    });

    it('should handle empty paths', () => {
      const result = sanitizePath('');
      expect(result).toBe('');
    });

    it('should handle paths with multiple illegal characters', () => {
      const result = sanitizePath('path/to/<file>:*.txt', 'windows');
      expect(result).toBe('path/to/file.txt');
    });

    it('should handle auto OS detection', () => {
      const result = sanitizePath('path/to/file?.txt');
      const expected = getCurrentOS() === 'windows' ? 'path/to/file.txt' : 'path/to/file?.txt';
      expect(result).toBe(expected);
    });
  });

  describe('getCurrentOS', () => {
    it('should return a valid OS type', () => {
      const os = getCurrentOS();
      expect(['windows', 'posix']).toContain(os);
    });
  });

  // Type tests
  describe('type exports', () => {
    it('should export all required types', () => {
      const options: ValidationOptions = {
        os: 'windows',
        allowTraversal: false,
        maxLength: 260,
        allowAbsolute: true,
        allowRelative: true,
      };
      expect(options).toBeDefined();

      const normOptions: NormalizationOptions = {
        os: 'posix',
        forceForwardSlash: true,
        removeTrailingSlash: true,
        toLowerCase: false,
      };
      expect(normOptions).toBeDefined();

      const osType: OSType = 'auto';
      expect(osType).toBeDefined();
    });
  });
});
