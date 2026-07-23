# React + TypeScript + Vite

Foody Music includes an OpenAI-powered AI Concierge that generates real recipes from natural-language cooking requests.

## Environment setup

Copy `.env.example` to `.env.local` and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Required variable:

- `OPENAI_API_KEY` — your OpenAI API key (server-side only, never exposed to the browser)

Optional:

- `OPENAI_MODEL` — defaults to `gpt-4o-mini`

## Local development

1. Install dependencies: `npm install`
2. Add your API key to `.env.local`
3. Start the dev server: `npm run dev`
4. Open the Concierge at `/` or `/concierge` — it calls `/api/concierge` via the Vite dev middleware

## Vercel deployment

Add `OPENAI_API_KEY` to your Vercel project environment variables before deploying.
