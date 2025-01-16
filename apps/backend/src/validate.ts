import type { RequestHandler } from "express";
import { ZodError, ZodSchema } from "zod";

export function validate<TBody>(schema: ZodSchema<TBody>): RequestHandler<any, any, TBody, any> {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue) => ({
                    message: `${issue.path.join(".")} is ${issue.message}`,
                }));
                res.status(400).json({ error: "Invalid data", details: errorMessages });
            } else {
                throw error;
            }
        }
    };
}
