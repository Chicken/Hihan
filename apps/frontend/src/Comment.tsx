import type { Comment } from "@/schema.js";
import { CircleUserRound } from "lucide-react";

function renderContent(content: string) {
  const lines = content.split("\n");
  return lines.map((l, i) => <p key={i}>{l}</p>);
}

const timeUnits = [
  { label: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { label: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { label: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "day", ms: 24 * 60 * 60 * 1000 },
  { label: "hour", ms: 60 * 60 * 1000 },
  { label: "minute", ms: 60 * 1000 },
  { label: "second", ms: 1000 },
] as const;

function renderTimestamp(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 5000) return "Just now";

  for (const unit of timeUnits) {
    const value = Math.floor(diff / unit.ms);
    if (value > 0) {
      if (value === 1) return `1 ${unit.label} ago`;
      return `${value} ${unit.label}s ago`;
    }
  }

  return "Just now";
}

export function Comment({ comment }: { comment: Comment }) {
  return (
    <div>
      <div className="flex w-full flex-row gap-2">
        <CircleUserRound className="h-8 w-8 flex-shrink-0 text-subtext" />
        <div>
          <div className="flex flex-row gap-2">
            <span className="max-w-80 text-wrap rounded-md bg-secondary px-1 py-0.5">{comment.name}</span>
            <wbr />
            <span className="whitespace-nowrap text-subtext">{renderTimestamp(comment.timestamp)}</span>
          </div>
          <div className="p-1">{renderContent(comment.content)}</div>
        </div>
      </div>
      {comment.replies?.length ? (
        <div className="ml-4 border-l-2 border-primary pl-4">
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
