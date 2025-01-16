import { z } from "zod";

const baseCommentSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  name: z.string(),
  content: z.string(),
});

export type Comment = z.infer<typeof baseCommentSchema> & {
  replies?: Comment[];
};

const commentSchema: z.ZodType<Comment> = baseCommentSchema.extend({
  replies: z.lazy(() => z.array(commentSchema)),
});

export const dataSchema = z.object({
  results: z.array(commentSchema),
  pages: z.number(),
});

export type Data = z.infer<typeof dataSchema>;
