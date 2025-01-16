import { db } from "./db/client.js";
import { comments, embeds } from "./db/schema.js";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { validate } from "./validate.js";
import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import { rateLimit } from "express-rate-limit";
import assert from "node:assert";
import { z } from "zod";

const app = express();
app.use(express.json());
app.set("x-powered-by", false);
if (env.TRUST_PROXY) app.set("trust proxy", env.TRUST_PROXY);

app.listen(env.PORT, () => {
    logger.success(`Backend listening on ${env.PORT}`);
});

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.post("/api/new-embed", async (req, res) => {
    const [authMethod, authToken] = (req.headers.authorization ?? "").split(" ");
    if (authMethod !== "Bearer" || authToken !== env.TOKEN) {
        res.status(401).json({ error: "Not authorized" });
        return;
    }
    const inserted = await db.insert(embeds).values({}).returning({ id: embeds.id });
    const id = inserted[0]!.id;
    assert(id);
    res.status(200).json({ id });
});

app.get("/api/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ error: "Invalid ID" });
        return;
    }
    const page = req.query.page ? parseInt(req.query.page as string, 10) - 1 : 0;
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string, 10) : 10;

    if (isNaN(page) || isNaN(perPage)) {
        res.status(400).json({ error: "Invalid parameters" });
        return;
    }

    const embed = await db.query.embeds.findFirst({ where: eq(embeds.id, id) });
    if (!embed) {
        res.status(404).json({ error: "Embed not found" });
        return;
    }

    const totalCommentsRows = await db
        .select({ count: count() })
        .from(comments)
        .where(and(eq(comments.embedId, id), isNull(comments.inReplyId)));
    const totalComments = totalCommentsRows[0]!.count;
    if (totalComments === 0) {
        res.json({
            results: [],
            pages: 0,
        });
        return;
    }
    assert(totalComments);
    const totalPages = Math.ceil(totalComments / perPage);
    if (page < 0 || page >= totalPages) {
        res.status(400).json({ error: "Invalid page" });
        return;
    }

    const results = await db.query.comments.findMany({
        columns: {
            embedId: false,
            inReplyId: false,
        },
        with: {
            replies: {
                columns: {
                    embedId: false,
                    inReplyId: false,
                },
                orderBy: asc(comments.timestamp),
            },
        },
        where: and(eq(comments.embedId, id), isNull(comments.inReplyId)),
        orderBy: desc(comments.timestamp),
        limit: perPage,
        offset: perPage * page,
    });

    res.json({
        results,
        pages: totalPages,
    });
});

app.post(
    "/api/:id/add-comment",
    rateLimit({
        windowMs: 5 * 60 * 1000,
        limit: 5,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: { error: "Ratelimit exceeded" },
    }),
    validate(
        z.object({
            name: z
                .string()
                .min(1)
                .max(64)
                .transform((str) => str.trim()),
            content: z
                .string()
                .min(1)
                .max(512)
                .transform((str) => str.trim()),
            inReply: z.string().optional(),
        })
    ),
    async (req, res) => {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ error: "Invalid ID" });
            return;
        }

        if (!req.body.name.length || !req.body.content.length) {
            res.status(400).json({ error: "Empty name or content" });
            return;
        }

        const embed = await db.query.embeds.findFirst({ where: eq(embeds.id, id) });
        if (!embed) {
            res.status(404).json({ error: "Embed not found" });
            return;
        }

        if (req.body.inReply) {
            const existing = await db
                .select({ id: comments.id })
                .from(comments)
                .where(and(eq(comments.id, req.body.inReply), isNull(comments.inReplyId)))
                .limit(1);
            if (!existing.length) {
                res.status(404).json({ error: "Comment to reply not found" });
                return;
            }
        }

        const inserted = await db
            .insert(comments)
            .values({
                embedId: id,
                timestamp: Date.now(),
                name: req.body.name,
                content: req.body.content,
                inReplyId: req.body.inReply,
            })
            .returning({ id: comments.id });

        const commentId = inserted[0]!.id;
        assert(commentId);

        res.status(200).json({
            message: "Success",
            id: commentId,
        });
    }
);

app.use("/api", async (req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.use("/api", (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    logger.error(err);
    res.status(500).json({ error: "Internal server error" });
});
