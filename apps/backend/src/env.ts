import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
    server: {
        PORT: z
            .string()
            .default("8080")
            .transform((v) => parseInt(v, 10))
            .pipe(z.number().min(1).max(65535)),
        TOKEN: z.string(),
        TRUST_PROXY: z.string(),
    },
});
