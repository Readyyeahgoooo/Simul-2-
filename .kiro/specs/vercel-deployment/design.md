# Design Document: Vercel Deployment with OpenRouter API

## Overview

This design addresses the deployment of the Vibe Life Simulator to Vercel by restructuring the API endpoint to work with Vercel's serverless function architecture. The solution involves moving the API handler to the correct location (`/api/llm.ts`), configuring environment variables for the OpenRouter API key, and ensuring the frontend correctly communicates with the serverless backend.

The application uses a React/Vite frontend that makes API calls to generate AI-powered life simulation events. The backend serverless function proxies requests to OpenRouter's API, which provides access to the Xiaomi MiMo-V2-Flash model.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   User Browser  │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP POST /api/llm
         ▼
┌─────────────────┐
│ Vercel Platform │
│                 │
│  ┌───────────┐  │
│  │  Static   │  │ (Vite build output)
│  │  Assets   │  │
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │ Serverless│  │ (/api/llm.ts)
│  │ Function  │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   OpenRouter    │
│      API        │
└─────────────────┘
```

### Directory Structure

```
project-root/
├── api/
│   └── llm.ts              # Vercel serverless function
├── components/             # React components
├── services/
│   └── geminiService.ts    # Frontend API client
├── public/                 # Static assets
├── dist/                   # Vite build output (generated)
├── vercel.json             # Vercel configuration
├── vite.config.ts          # Vite build configuration
└── package.json
```

## Components and Interfaces

### 1. Vercel Serverless Function (`/api/llm.ts`)

**Purpose:** Handle API requests from the frontend and proxy them to OpenRouter API.

**Interface:**
```typescript
// Request (from frontend)
interface LLMRequest {
  model?: string;              // Optional model override
  messages: Array<{            // Chat messages
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  enableReasoning?: boolean;   // Optional reasoning mode
}

// Response (to frontend)
interface LLMResponse {
  event: string;               // Main event description
  statChanges?: {              // Optional stat modifications
    [key: string]: number;
  };
  skillUpdates?: {             // Optional skill updates
    [key: string]: number;
  };
  itemDrop?: {                 // Optional item reward
    name: string;
    description: string;
  };
  achievement?: {              // Optional achievement
    title: string;
    description: string;
  };
  summaryUpdate?: string;      // Optional summary update
}

// Error Response
interface ErrorResponse {
  error: string;
  details?: any;
  message?: string;
}
```

**Implementation Details:**
- Export a default async function handler compatible with Vercel's serverless runtime
- Read `OPENROUTER_API_KEY` from `process.env`
- Read optional `OPENROUTER_MODEL` from `process.env` (default: `xiaomi/mimo-v2-flash:free`)
- Validate request method (POST only)
- Validate request body (messages array required)
- Make fetch request to OpenRouter API with proper headers
- Parse response and extract JSON content
- Handle JSON extraction from markdown-wrapped responses
- Return parsed JSON or safe fallback

### 2. Vercel Configuration (`vercel.json`)

**Purpose:** Configure build settings and routing for Vercel deployment.

**Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**Key Settings:**
- `buildCommand`: Specifies the Vite build command
- `outputDirectory`: Points to Vite's output directory
- `framework`: Tells Vercel to use Vite-specific optimizations
- `rewrites`: Ensures API routes are handled by serverless functions

### 3. Frontend API Client (`services/geminiService.ts`)

**Current Implementation:** Already correctly configured to call `/api/llm`

**No changes needed** - the service already makes POST requests to `/api/llm` with the correct payload structure.

### 4. Environment Variables

**Configuration Location:** Vercel Project Settings → Environment Variables

**Required Variables:**
- `OPENROUTER_API_KEY`: Your OpenRouter API key (required)
- `OPENROUTER_MODEL`: Model to use (optional, defaults to `xiaomi/mimo-v2-flash:free`)

**Access in Code:**
```typescript
const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free';
```

## Data Models

### OpenRouter API Request

```typescript
interface OpenRouterRequest {
  model: string;                    // e.g., "xiaomi/mimo-v2-flash:free"
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;             // Default: 0.7
  reasoning?: {                     // Optional reasoning mode
    enabled: boolean;
  };
}
```

### OpenRouter API Response

```typescript
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;              // JSON string or markdown-wrapped JSON
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Key Validation

*For any* request to the serverless function, if the `OPENROUTER_API_KEY` environment variable is not set, the function should return a 500 error with a descriptive message.

**Validates: Requirements 2.2, 3.1, 3.2**

### Property 2: Request Method Validation

*For any* HTTP request to `/api/llm`, if the method is not POST, the function should return a 405 Method Not Allowed error.

**Validates: Requirements 2.1**

### Property 3: Message Array Validation

*For any* request body, if the `messages` field is not an array or is empty, the function should return a 400 Bad Request error.

**Validates: Requirements 2.1**

### Property 4: Model Selection

*For any* request, if no model is specified in the request body, the function should use the value from `OPENROUTER_MODEL` environment variable, or default to `xiaomi/mimo-v2-flash:free`.

**Validates: Requirements 2.3, 3.4**

### Property 5: JSON Response Parsing

*For any* OpenRouter API response containing JSON (either direct or markdown-wrapped), the serverless function should successfully extract and return valid JSON to the frontend.

**Validates: Requirements 2.4**

### Property 6: Error Propagation

*For any* OpenRouter API error response, the serverless function should return the error status code and details to the frontend.

**Validates: Requirements 2.5, 6.2**

### Property 7: Safe Fallback

*For any* OpenRouter response that cannot be parsed as JSON, the serverless function should return a safe fallback object with the raw content in the `event` field.

**Validates: Requirements 6.3**

### Property 8: Frontend API Endpoint

*For any* simulation start or turn action, the frontend should make a POST request to `/api/llm` with the correct message structure.

**Validates: Requirements 4.2**

### Property 9: Build Output Structure

*For any* successful Vercel build, the output should include both the `dist` directory with static assets and the `api` directory with compiled serverless functions.

**Validates: Requirements 5.1, 5.2, 5.3**

## Error Handling

### 1. Missing API Key

**Scenario:** `OPENROUTER_API_KEY` environment variable is not set

**Response:**
```json
{
  "error": "Missing OPENROUTER_API_KEY on server"
}
```

**Status Code:** 500

### 2. Invalid Request Method

**Scenario:** Request method is not POST

**Response:**
```json
{
  "error": "Method Not Allowed"
}
```

**Status Code:** 405

### 3. Missing Messages

**Scenario:** Request body is missing `messages` array or it's empty

**Response:**
```json
{
  "error": "Missing messages[]"
}
```

**Status Code:** 400

### 4. OpenRouter API Error

**Scenario:** OpenRouter API returns an error

**Response:**
```json
{
  "error": "OpenRouter error",
  "details": { /* OpenRouter error details */ }
}
```

**Status Code:** Same as OpenRouter response

### 5. JSON Parsing Failure

**Scenario:** Response content cannot be parsed as JSON

**Response:**
```json
{
  "event": "Model returned empty content." // or raw content
}
```

**Status Code:** 200 (safe fallback)

### 6. Network/Server Error

**Scenario:** Fetch fails or unexpected error occurs

**Response:**
```json
{
  "error": "Server error",
  "message": "Error message details"
}
```

**Status Code:** 500

## Testing Strategy

### Unit Tests

**Test Files:**
- `api/llm.test.ts` - Test serverless function logic
- `services/geminiService.test.ts` - Test frontend API client

**Unit Test Cases:**
1. **API Key Validation**
   - Test missing API key returns 500 error
   - Test valid API key allows request to proceed

2. **Request Validation**
   - Test non-POST methods return 405
   - Test missing messages array returns 400
   - Test empty messages array returns 400
   - Test valid request structure passes validation

3. **Model Selection**
   - Test default model when none specified
   - Test environment variable model override
   - Test request body model override

4. **JSON Parsing**
   - Test direct JSON response parsing
   - Test markdown-wrapped JSON extraction
   - Test malformed JSON fallback handling

5. **Error Handling**
   - Test OpenRouter error propagation
   - Test network error handling
   - Test safe fallback for unparseable responses

### Property-Based Tests

**Framework:** fast-check (for TypeScript/JavaScript)

**Configuration:** Minimum 100 iterations per test

**Property Test Cases:**

1. **Property 1: API Key Validation**
   - Generate random request payloads
   - Test with missing API key
   - Verify all return 500 error
   - **Tag:** Feature: vercel-deployment, Property 1: API Key Validation

2. **Property 2: Request Method Validation**
   - Generate random HTTP methods (GET, PUT, DELETE, PATCH, etc.)
   - Verify all non-POST methods return 405
   - **Tag:** Feature: vercel-deployment, Property 2: Request Method Validation

3. **Property 3: Message Array Validation**
   - Generate random invalid message structures (null, undefined, empty, non-array)
   - Verify all return 400 error
   - **Tag:** Feature: vercel-deployment, Property 3: Message Array Validation

4. **Property 4: Model Selection**
   - Generate random model values (undefined, empty string, valid model names)
   - Verify correct model is selected based on priority
   - **Tag:** Feature: vercel-deployment, Property 4: Model Selection

5. **Property 5: JSON Response Parsing**
   - Generate random valid JSON responses (direct and markdown-wrapped)
   - Verify all are successfully parsed
   - **Tag:** Feature: vercel-deployment, Property 5: JSON Response Parsing

### Integration Tests

1. **End-to-End Deployment Test**
   - Deploy to Vercel preview environment
   - Test frontend loads correctly
   - Test API endpoint responds to requests
   - Verify environment variables are accessible

2. **OpenRouter Integration Test**
   - Test actual API call to OpenRouter (with valid key)
   - Verify response format matches expectations
   - Test error handling with invalid key

### Manual Testing Checklist

1. ✅ Deploy to Vercel
2. ✅ Configure `OPENROUTER_API_KEY` in Vercel project settings
3. ✅ Visit deployed URL and verify setup form loads
4. ✅ Start a simulation and verify AI response appears
5. ✅ Test multiple turns to verify continued functionality
6. ✅ Check browser console for errors
7. ✅ Verify no API keys are exposed in frontend code

## Deployment Steps

### 1. Prepare Repository

- Ensure `/api/llm.ts` exists with serverless function code
- Ensure `vercel.json` exists with correct configuration
- Commit and push changes to Git repository

### 2. Configure Vercel Project

- Connect repository to Vercel
- Set framework preset to "Vite"
- Configure environment variables:
  - `OPENROUTER_API_KEY`: Your OpenRouter API key
  - `OPENROUTER_MODEL`: `xiaomi/mimo-v2-flash:free` (optional)

### 3. Deploy

- Trigger deployment (automatic on push or manual)
- Wait for build to complete
- Verify deployment success

### 4. Test Deployment

- Visit deployed URL
- Test application functionality
- Check Vercel function logs for any errors

## Notes

- The existing `api.ts` file in the root can be removed after migration
- The frontend code (`services/geminiService.ts`) already uses the correct endpoint
- Vercel automatically detects files in `/api` directory as serverless functions
- Environment variables are injected at runtime, not build time
- The free tier of OpenRouter may have rate limits
