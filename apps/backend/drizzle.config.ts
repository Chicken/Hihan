import { type Config } from "drizzle-kit";

export default {
    out: "./migrations",
    schema: "./src/db/schema.ts",
    dialect: "sqlite",
    dbCredentials: {
        url: "file:./data/db.sqlite",
    },
} satisfies Config;
