# Next15-Tailwindcss-FastAPI-Prisma-Turbo 🏎️

Lightweight Next 15 frontend, FastAPI server, shared Prisma ORM, and excellent dev tooling. Fully configured `tailwindcss`, `typescript`, and `.env` files. Everything you need to start your next failed side project.

## Quick Start

```
yarn install
yarn dev
```

## Why Python?

Oftentimes a Next.js frontend will call Python libraries, which may influence state and make changes to the DB. Examples include audio/video processing and machine learning. It's ideal to therefore work with a single ORM and a single schema file - a single source of truth.

## Batteries included

### Next.js 15

1. tailwindcss
2. Shadcn UI
3. @clerk/nextjs
4. Prisma

### FastAPI

1. async/await FastAPI
2. Docker
3. Docker compose -> hot reload
4. Prisma

### AI

1. Vercel AI SDK
2. anthropic
3. openai

### Styling

1. clsx
2. class-variance-authority
3. lucide-react
4. react-loader-spinner
5. sonner

### Developer tools

1. prettier
2. prettier-plugin-tailwindcss
3. @ianvs/prettier-plugin-sort-imports
4. turborepo

## Apps and Packages

- `docs`: a sample [Next.js](https://nextjs.org/) app
- `web`: a custom [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@repo/tailwind-config`: `tailwind.config.ts` well-placed so you don't have to figure out where to place it

## Future improvements

1. Postgres
2. ffmpeg
3. TODO
