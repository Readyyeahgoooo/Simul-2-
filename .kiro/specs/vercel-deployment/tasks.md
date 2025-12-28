# Implementation Plan: Vercel Deployment with OpenRouter API

## Overview

This implementation plan restructures the application for Vercel deployment by creating a proper serverless function endpoint, configuring Vercel settings, and ensuring the frontend correctly communicates with the backend. The tasks are organized to build incrementally, with testing integrated throughout.

## Tasks

- [x] 1. Create Vercel serverless function endpoint
  - Create `/api` directory in project root
  - Create `/api/llm.ts` file with serverless function handler
  - Implement request validation (method, body structure)
  - Implement environment variable reading (OPENROUTER_API_KEY, OPENROUTER_MODEL)
  - Implement OpenRouter API fetch with proper headers
  - Implement JSON parsing with markdown extraction fallback
  - Implement error handling for all failure scenarios
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.4, 6.1, 6.2, 6.3, 6.4_

- [x] 1.1 Write property test for API key validation
  - **Property 1: API Key Validation**
  - **Validates: Requirements 2.2, 3.1, 3.2**

- [x] 1.2 Write property test for request method validation
  - **Property 2: Request Method Validation**
  - **Validates: Requirements 2.1**

- [x] 1.3 Write property test for message array validation
  - **Property 3: Message Array Validation**
  - **Validates: Requirements 2.1**

- [x] 1.4 Write property test for model selection
  - **Property 4: Model Selection**
  - **Validates: Requirements 2.3, 3.4**

- [x] 1.5 Write property test for JSON response parsing
  - **Property 5: JSON Response Parsing**
  - **Validates: Requirements 2.4**

- [x] 1.6 Write unit tests for error handling
  - Test missing API key error response
  - Test invalid method error response
  - Test missing messages error response
  - Test OpenRouter error propagation
  - Test JSON parsing fallback
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Create Vercel configuration file
  - Create `vercel.json` in project root
  - Configure build command to use Vite
  - Configure output directory to `dist`
  - Configure framework preset to `vite`
  - Add API route rewrites if needed
  - _Requirements: 1.3, 5.1, 5.2, 5.4_

- [x] 2.1 Write property test for build output structure
  - **Property 9: Build Output Structure**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 3. Verify frontend API client configuration
  - Review `services/geminiService.ts` to confirm `/api/llm` endpoint usage
  - Verify request payload structure matches serverless function expectations
  - Verify error handling in frontend matches backend error responses
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3.1 Write property test for frontend API endpoint
  - **Property 8: Frontend API Endpoint**
  - **Validates: Requirements 4.2**

- [x] 4. Checkpoint - Test locally with Vercel CLI
  - Install Vercel CLI: `npm i -g vercel`
  - Run `vercel dev` to test serverless function locally
  - Test setup form loads correctly
  - Test starting a simulation with mock API key
  - Test error handling with missing API key
  - Verify all tests pass
  - Ask the user if questions arise

- [x] 5. Clean up legacy files
  - Remove or rename root-level `api.ts` file (no longer needed)
  - Update any documentation referencing old API structure
  - _Requirements: 3.3_

- [x] 6. Create deployment documentation
  - Create `DEPLOYMENT.md` with step-by-step Vercel deployment instructions
  - Document required environment variables
  - Document how to configure OpenRouter API key in Vercel
  - Document how to verify successful deployment
  - Include troubleshooting section for common issues
  - _Requirements: 6.1_

- [x] 7. Final checkpoint - Deploy to Vercel
  - Push changes to Git repository
  - Connect repository to Vercel (if not already connected)
  - Configure environment variables in Vercel project settings:
    - `OPENROUTER_API_KEY`: User's OpenRouter API key
    - `OPENROUTER_MODEL`: `xiaomi/mimo-v2-flash:free`
  - Trigger deployment
  - Verify deployment succeeds
  - Test deployed application:
    - Visit deployed URL
    - Verify setup form loads (no black screen)
    - Start a simulation
    - Verify AI responses appear
    - Test multiple turns
  - Check Vercel function logs for any errors
  - Ensure all tests pass
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster deployment
- The frontend code (`services/geminiService.ts`) already uses the correct `/api/llm` endpoint
- Vercel automatically detects files in `/api` directory as serverless functions
- Environment variables must be configured in Vercel project settings before deployment
- The OpenRouter free tier may have rate limits
- Local testing with `vercel dev` requires the Vercel CLI to be installed
- Property tests use fast-check framework with minimum 100 iterations
