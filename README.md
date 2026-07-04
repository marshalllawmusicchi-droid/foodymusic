# React + TypeScript + Vite

This app now supports an OpenAI-backed concierge experience.

## Environment setup

Set the following environment variable before running locally or deploying:

- OPENAI_API_KEY=your_openai_api_key_here

The API key is read only by the server-side concierge endpoint and is never exposed in the browser.

## Local development

1. Install dependencies with npm install
2. Start the Vite app with npm run dev
3. The concierge UI will call the server endpoint at /api/concierge

## Vercel deployment

Add OPENAI_API_KEY to your Vercel environment variables before deploying.
