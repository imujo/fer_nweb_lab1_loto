import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_R2zKbco4gYqH@ep-green-water-aep8y3lw-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
    // url: process.env.DATABASE_URL!,
  },
});
