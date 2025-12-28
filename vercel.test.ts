import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import * as fc from 'fast-check';

describe('Property 9: Build Output Structure - Feature: vercel-deployment, Property 9: Build Output Structure', () => {
  it('should have correct Vercel configuration structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          // Verify vercel.json exists
          const vercelConfigPath = resolve(process.cwd(), 'vercel.json');
          expect(existsSync(vercelConfigPath)).toBe(true);

          // Verify api directory exists
          const apiDirPath = resolve(process.cwd(), 'api');
          expect(existsSync(apiDirPath)).toBe(true);

          // Verify api/llm.ts exists
          const apiLlmPath = resolve(process.cwd(), 'api', 'llm.ts');
          expect(existsSync(apiLlmPath)).toBe(true);

          // Verify vercel.json has correct structure
          const vercelConfig = require('./vercel.json');
          expect(vercelConfig).toHaveProperty('buildCommand');
          expect(vercelConfig).toHaveProperty('outputDirectory', 'dist');
          expect(vercelConfig).toHaveProperty('framework', 'vite');
        }
      ),
      { numRuns: 100 }
    );
  });
});
