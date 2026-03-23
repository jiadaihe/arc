import type { Config } from "drizzle-kit";

export default {
  schema: ["./db/schema.ts", "./lib/auth-schema.ts"],
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./arc.db",
  },
} satisfies Config;
