/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 */
export const dependencyVersionMap = {
  // NextAuth.js
  "next-auth": "5.0.0-beta.25",
  "@auth/prisma-adapter": "^2.7.2",
  "@auth/drizzle-adapter": "^1.7.2",

  // WorkOS AuthKit
  "@workos-inc/authkit-nextjs": "^2.6.0",

  // Prisma
  prisma: "^6.6.0",
  "@prisma/client": "^6.6.0",
  "@prisma/adapter-planetscale": "^6.6.0",

  // Drizzle
  "drizzle-kit": "^0.30.5",
  "drizzle-orm": "^0.41.0",
  mysql2: "^3.11.0",
  "@planetscale/database": "^1.19.0",
  postgres: "^3.4.4",
  "@libsql/client": "^0.14.0",

  // TailwindCSS
  tailwindcss: "^4.1.0",
  postcss: "^8.5.3",
  "@tailwindcss/postcss": "^4.1.0",

  // tRPC
  "@trpc/client": "^11.0.0",
  "@trpc/server": "^11.0.0",
  "@trpc/react-query": "^11.0.0",
  "@trpc/next": "^11.0.0",
  "@tanstack/react-query": "^5.69.0",
  superjson: "^2.2.1",
  "server-only": "^0.0.1",

  // Expo & React Native
  expo: "~54.0.0",
  "expo-router": "~6.0.10",
  "expo-status-bar": "~3.0.8",
  "expo-linking": "~8.0.8",
  "expo-constants": "~18.0.9",
  "expo-font": "~14.0.8",
  "expo-splash-screen": "~31.0.10",
  "react-native": "0.81.4",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0",
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-web": "^0.21.0",

  // NativeWind (uses Tailwind v3 for now)
  nativewind: "^4.0.0",

  // React (Expo uses exactly 19.1.0)
  react: "19.1.0",
  "react-dom": "19.1.0",

  // shadcn-ui
  "class-variance-authority": "^0.7.1",
  clsx: "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "lucide-react": "^0.468.0",

  // Monorepo tooling
  "@moonrepo/cli": "^1.32.0",
  "dotenv-cli": "^8.0.0",

  // biome
  "@biomejs/biome": "1.9.4",

  // eslint / prettier
  prettier: "^3.5.3",
  "@eslint/eslintrc": "^3.3.1",
  "prettier-plugin-tailwindcss": "^0.6.11",
  eslint: "^9.23.0",
  "eslint-config-next": "^15.2.3",
  "eslint-plugin-drizzle": "^0.2.3",
  "typescript-eslint": "^8.27.0",
} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;
