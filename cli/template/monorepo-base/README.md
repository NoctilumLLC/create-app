# Create T3 App Monorepo

This is a monorepo created with [create-t3-app](https://create.t3.gg/).

## What's inside?

This monorepo includes the following packages/apps:

### Apps

- `web`: Next.js app
- `expo`: Expo/React Native app

### Packages

- `@repo/api`: tRPC API routes
- `@repo/db`: Database schema and client
- `@repo/auth`: Authentication configuration
- `@repo/ui`: Shared UI components
- `@repo/config`: Shared configuration (Biome, TypeScript)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- [moon](https://moonrepo.dev/) for task running

### Install Dependencies

```bash
bun install
```

### Development

Run both apps concurrently:

```bash
bun dev
```

Or run individually:

```bash
# Web app
bun dev:web

# Expo app
bun dev:expo
```

### Build

Build all apps:

```bash
bun build
```

### Other Commands

```bash
# Type checking
bun typecheck

# Linting
bun lint

# Formatting
bun format

# Clean cache
bun clean
```

## Learn More

To learn more about the tools used in this monorepo:

- [Next.js](https://nextjs.org)
- [Expo](https://expo.dev)
- [tRPC](https://trpc.io)
- [Tailwind CSS](https://tailwindcss.com)
- [moonrepo](https://moonrepo.dev)
