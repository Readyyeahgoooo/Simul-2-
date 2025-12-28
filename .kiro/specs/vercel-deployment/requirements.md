# Requirements Document

## Introduction

This specification addresses the deployment of the Vibe Life Simulator application to Vercel with proper OpenRouter API integration. The application currently fails to load (black screen) on Vercel because the API endpoint structure is not configured correctly for Vercel's serverless function architecture, and the OpenRouter API key needs to be securely managed through environment variables.

## Glossary

- **Vercel**: Cloud platform for static sites and serverless functions
- **OpenRouter**: API gateway service that provides access to multiple AI models
- **Serverless_Function**: Backend code that runs on-demand in Vercel's infrastructure
- **Environment_Variable**: Secure configuration value stored in Vercel's project settings
- **Frontend**: The React/Vite application that runs in the user's browser
- **API_Route**: Vercel serverless function endpoint accessible via HTTP
- **Build_Output**: Compiled static files and serverless functions ready for deployment

## Requirements

### Requirement 1: Vercel API Route Structure

**User Story:** As a developer, I want to deploy the application to Vercel, so that users can access the life simulation app online.

#### Acceptance Criteria

1. WHEN the application is deployed to Vercel, THE Serverless_Function SHALL be located in the `/api` directory with proper file naming
2. WHEN the frontend makes a request to `/api/llm`, THE Serverless_Function SHALL handle the request and return a valid response
3. THE Build_Output SHALL include both static frontend files and the serverless function
4. WHEN Vercel builds the project, THE build process SHALL complete successfully without errors

### Requirement 2: OpenRouter API Integration

**User Story:** As a developer, I want to use OpenRouter API with the Xiaomi MiMo-V2-Flash model, so that the application can generate AI responses without exposing API keys.

#### Acceptance Criteria

1. WHEN the Serverless_Function receives a request, THE Serverless_Function SHALL use the OpenRouter API key from environment variables
2. WHEN no API key is configured, THE Serverless_Function SHALL return a descriptive error message
3. THE Serverless_Function SHALL default to the `xiaomi/mimo-v2-flash:free` model when no model is specified
4. WHEN the OpenRouter API returns a response, THE Serverless_Function SHALL parse and forward the response to the frontend
5. WHEN the OpenRouter API returns an error, THE Serverless_Function SHALL handle it gracefully and return a meaningful error message

### Requirement 3: Environment Variable Configuration

**User Story:** As a developer, I want to configure the OpenRouter API key through Vercel environment variables, so that the key remains secure and is not exposed in the frontend code.

#### Acceptance Criteria

1. THE Serverless_Function SHALL read the `OPENROUTER_API_KEY` from process.env
2. WHEN the environment variable is missing, THE Serverless_Function SHALL return a 500 error with a clear message
3. THE Frontend SHALL NOT contain any hardcoded API keys
4. THE Serverless_Function SHALL optionally read `OPENROUTER_MODEL` from environment variables to allow model customization

### Requirement 4: Frontend API Client Configuration

**User Story:** As a user, I want the application to load correctly on Vercel, so that I can use the life simulation features.

#### Acceptance Criteria

1. WHEN the application loads, THE Frontend SHALL display the setup form correctly
2. WHEN the user starts a simulation, THE Frontend SHALL make a POST request to `/api/llm`
3. WHEN the API request succeeds, THE Frontend SHALL display the simulation response
4. WHEN the API request fails, THE Frontend SHALL display a user-friendly error message
5. THE Frontend SHALL handle loading states during API requests

### Requirement 5: Build Configuration

**User Story:** As a developer, I want the Vite build process to work correctly with Vercel, so that the application deploys successfully.

#### Acceptance Criteria

1. WHEN Vercel builds the project, THE build process SHALL use the correct output directory
2. THE Build_Output SHALL include all necessary static assets (HTML, CSS, JS)
3. THE Serverless_Function SHALL be compiled and deployed separately from static assets
4. WHEN the build completes, THE deployment SHALL be accessible via the Vercel URL

### Requirement 6: Error Handling and Debugging

**User Story:** As a developer, I want clear error messages during deployment and runtime, so that I can quickly identify and fix issues.

#### Acceptance Criteria

1. WHEN the API key is missing, THE error message SHALL indicate which environment variable is required
2. WHEN the OpenRouter API fails, THE error message SHALL include the status code and error details
3. WHEN JSON parsing fails, THE Serverless_Function SHALL attempt to extract JSON from the response or return a safe fallback
4. THE Serverless_Function SHALL log errors for debugging purposes
