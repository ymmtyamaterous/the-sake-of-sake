import { env } from "@better-t-app/env/server";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seed } from "./seed";

import * as schema from "./schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrateAndSeed() {
  const client = createClient({ url: env.DATABASE_URL });
  const db = drizzle({ client, schema });

  const migrationsFolder =
    process.env.MIGRATIONS_FOLDER ?? path.join(__dirname, "migrations");
  console.log("🔄 Running migrations from:", migrationsFolder);
  await migrate(db, { migrationsFolder });
  console.log("✅ Migrations applied");

  await seed(db as Parameters<typeof seed>[0]);

  client.close();
}
