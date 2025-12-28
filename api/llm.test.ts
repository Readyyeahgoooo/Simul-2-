import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import handler from './llm';

// Mock VercelRequest and VercelResponse
const createMockRequest = (overrides: any = {}): any => ({
  method: 'POST',
  headers: {},
  body: { messages: [{ role: 'user', content: 'test' }] },
  ...overrides,
});

const createMockResponse = (): any => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

describe('API Endpoint Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  describe('Property 1: API Key Validation - Feature: vercel-deployment, Property 1: API Key Validation', () => {
    it('should return 500 error for any request when OPENROUTER_API_KEY is missing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({
            role: fc.constantFrom('user', 'system', 'assistant'),
            content: fc.string({ minLength: 1 })
          }), { minLength: 1 }),
          async (messages) => {
            // Save original env
            const originalKey = process.env.OPENROUTER_API_KEY;
            delete process.env.OPENROUTER_API_KEY;

            const req = createMockRequest({ body: { messages } });
            const res = createMockResponse();

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: expect.stringContaining('OPENROUTER_API_KEY')
              })
            );

            // Restore env
            if (originalKey) process.env.OPENROUTER_API_KEY = originalKey;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Request Method Validation - Feature: vercel-deployment, Property 2: Request Method Validation', () => {
    it('should return 405 error for any non-POST HTTP method', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'),
          async (method) => {
            const req = createMockRequest({ method });
            const res = createMockResponse();

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(405);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: 'Method Not Allowed'
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Message Array Validation - Feature: vercel-deployment, Property 3: Message Array Validation', () => {
    it('should return 400 error for any invalid messages structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant([]),
            fc.constant({}),
            fc.string(),
            fc.integer()
          ),
          async (invalidMessages) => {
            process.env.OPENROUTER_API_KEY = 'test-key';

            const req = createMockRequest({ body: { messages: invalidMessages } });
            const res = createMockResponse();

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: expect.stringContaining('messages')
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Model Selection - Feature: vercel-deployment, Property 4: Model Selection', () => {
    it('should select correct model based on priority: request > env > default', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.option(fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0 && !s.includes('"')), { nil: undefined }),
          fc.option(fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0 && !s.includes('"')), { nil: undefined }),
          async (requestModel, envModel) => {
            process.env.OPENROUTER_API_KEY = 'test-key';
            if (envModel) {
              process.env.OPENROUTER_MODEL = envModel;
            } else {
              delete process.env.OPENROUTER_MODEL;
            }

            const mockFetch = vi.fn().mockResolvedValue({
              ok: true,
              json: async () => ({
                choices: [{ message: { content: '{"event":"test"}' } }]
              })
            });
            global.fetch = mockFetch;

            const req = createMockRequest({
              body: {
                messages: [{ role: 'user', content: 'test' }],
                model: requestModel
              }
            });
            const res = createMockResponse();

            await handler(req, res);

            // Model selection logic from handler: request (if truthy and trimmed) > env > default
            const expectedModel = (requestModel && requestModel.trim()) ? requestModel : (envModel || 'xiaomi/mimo-v2-flash:free');
            
            const fetchCall = mockFetch.mock.calls[0];
            const bodyStr = fetchCall[1].body;
            const bodyObj = JSON.parse(bodyStr);
            
            expect(bodyObj.model).toBe(expectedModel);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: JSON Response Parsing - Feature: vercel-deployment, Property 5: JSON Response Parsing', () => {
    it('should successfully parse any valid JSON response (direct or markdown-wrapped)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            event: fc.string(),
            statChanges: fc.option(fc.dictionary(fc.string(), fc.integer())),
          }),
          async (jsonContent) => {
            process.env.OPENROUTER_API_KEY = 'test-key';

            const jsonString = JSON.stringify(jsonContent);
            
            // Test both direct JSON and markdown-wrapped
            const formats = [
              jsonString,
              `\`\`\`json\n${jsonString}\n\`\`\``,
              `Here's the response:\n${jsonString}\nEnd of response`,
            ];

            for (const content of formats) {
              const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                  choices: [{ message: { content } }]
                })
              });
              global.fetch = mockFetch;

              const req = createMockRequest();
              const res = createMockResponse();

              await handler(req, res);

              expect(res.status).toHaveBeenCalledWith(200);
              expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                  event: jsonContent.event
                })
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests: Error Handling', () => {
    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = 'test-key';
    });

    it('should return 500 error when API key is missing', async () => {
      delete process.env.OPENROUTER_API_KEY;

      const req = createMockRequest();
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Missing OPENROUTER_API_KEY on server'
        })
      );
    });

    it('should return 405 error for non-POST methods', async () => {
      const req = createMockRequest({ method: 'GET' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Method Not Allowed' });
    });

    it('should return 400 error when messages array is missing', async () => {
      const req = createMockRequest({ body: {} });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Missing messages[]'
        })
      );
    });

    it('should return 400 error when messages array is empty', async () => {
      const req = createMockRequest({ body: { messages: [] } });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should propagate OpenRouter API errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limit exceeded' } })
      });
      global.fetch = mockFetch;

      const req = createMockRequest();
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'OpenRouter error'
        })
      );
    });

    it('should return safe fallback for unparseable JSON', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'This is not JSON' } }]
        })
      });
      global.fetch = mockFetch;

      const req = createMockRequest();
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.any(String)
        })
      );
    });

    it('should handle network errors gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      const req = createMockRequest();
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Server error',
          message: 'Network error'
        })
      );
    });
  });
});
