import "dotenv/config";
import { defineConfig, env } from "@prisma/config"; // Documentation uses env() helper

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
