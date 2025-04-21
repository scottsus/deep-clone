# 🎙️ Deep Clone

I cloned my voice, gave it a knowledge base, and have it answer intro chats on my behalf.

![deep-clone-04-20-25](https://github.com/user-attachments/assets/9701088c-629a-4943-a37d-918910eecf7d)

## Why?

Will someone use my voice to trick my mom? Hopefully not. Just wanna play around with multimodal AI, adding spice to audio by having it engage in conversation, referencing some data source, and having it talk to my friends.

## Quick Start

1. Clone and install dependencies

```bash
yarn install
```

2. Add environment variables - see `.env.example` in each package.

3. Visit `http://localhost:3000` and watch the magic unfold

## Architecture

### `apps/web`

Standard Next.js web app. Frontend creates a Daily.co room, makes some Postgres writes, and faciliates exchange of audio between client and server.

### `apps/fastapi`

Dockerized FastAPI app. Makes calls to various AI providers like OpenAI for GPT 4o, ElevenLabs for TTS, Deepgram for realtime audio transcription.

### `packages/database`

Use Postgres - for obvious reasons, and Prisma ORM because it offers both node and python clients, so the same schema can be reused across multiple packages.

## Email notification shenanigans
<p align="center">
  <img src="https://github.com/user-attachments/assets/9b32d886-90ab-43b3-ad3a-26c020a9dd0d" width="300">
</p>

