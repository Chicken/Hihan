import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { mkdir } from "node:fs/promises";
import * as schema from "./schema.js";

await mkdir("./data", { recursive: true });
const client = createClient({ url: "file:./data/db.sqlite" });
export const db = drizzle(client, { schema });

await migrate(db, {
    migrationsFolder: "./migrations",
});
