import { AddComment } from "@/AddComment.js";
import { Comment } from "@/Comment.js";
import { PageSelector } from "@/PageSelector.js";
import { dataSchema } from "@/schema.js";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CircleX, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function Comments() {
  const location = useLocation();
  const id = location.pathname.split("/").at(-1);

  const [page, setPage] = useState(1);

  const { isPending, error, data } = useQuery({
    queryKey: ["comments", id, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await fetch(`/api/${id}?page=${page}`);
      if (res.status !== 200) {
        throw new Error("Failed to fetch comments");
      }
      return dataSchema.parse(await res.json());
    },
  });

  useEffect(() => {
    if (!isPending) {
      const resizeObserver = new ResizeObserver(() => {
        const editing = document.activeElement?.tagName === "TEXTAREA";
        if (window.parent) {
          window.parent.postMessage(
            {
              action: "set-size",
              width: document.body.scrollWidth,
              height: document.body.scrollHeight,
              editing,
            },
            "*"
          );
        }
      });
      resizeObserver.observe(document.body);
      return () => resizeObserver.disconnect();
    }
  }, [isPending]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="flex items-center justify-center">
        <CircleX className="mr-2 text-red-500" />
        <span>An error occured loading comments! Try refreshing the page.</span>
      </div>
    );
  }

  return (
    <>
      <AddComment post={id} />
      {data.pages !== 0 ? (
        <div className="mt-2 flex w-full flex-col gap-2 p-2">
          {data.results.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="pt-2 text-center">
          <p>No comments yet. Be the first to leave one!</p>
        </div>
      )}
      {data.pages > 1 ? <PageSelector pages={data.pages} page={page} setPage={setPage} /> : null}
    </>
  );
}
