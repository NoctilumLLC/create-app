import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: [
    "test-app-normal-workos-drizzle-postgres-trpc-tailwind-eslint-app-router_*",
  ],
} satisfies Config;
