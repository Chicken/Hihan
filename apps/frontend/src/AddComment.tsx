import { useStickyState } from "@/useStickyState.js";
import { useQueryClient } from "@tanstack/react-query";
import { CircleX, SendHorizontal } from "lucide-react";
import { useCallback, useState, type FormEvent, type KeyboardEvent } from "react";

export function AddComment({ post }: { post: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useStickyState("name", "");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmedName = name.trim();
      const trimmedContent = content.trim();
      if (!trimmedName.length || !trimmedContent.length) return;
      const res = await fetch(`/api/${post}/add-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          content: trimmedContent,
        }),
      });
      if (res.status !== 200) {
        try {
          const data = await res.json();
          setError(data.error);
        } catch (_e) {
          setError("Something went wrong!");
        }
        return;
      }
      setError(null);
      setContent("");
      queryClient.invalidateQueries();
    },
    [name, content]
  );

  const preventSubmit = useCallback((e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("message")?.focus();
    }
  }, []);

  return (
    <>
      <form className="flex w-full flex-col gap-y-1" onSubmit={handleSubmit}>
        <div className="flex w-full flex-row gap-x-2">
          <label className="w-16 self-center justify-self-end text-right" htmlFor="name">
            Name
          </label>
          <div className="relative grow">
            <input
              id="name"
              className="flex h-9 w-full rounded-md border-none bg-secondary py-1 pl-3 pr-[3.25rem] shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary md:text-sm focus:[&:user-invalid]:ring-red-500"
              value={name}
              pattern=".*\S.*"
              onInvalid={(e) => {
                if (!name.trim().length)
                  (e.target as HTMLInputElement).setCustomValidity("Name can't be whitespace only.");
              }}
              onChange={(e) => {
                (e.target as HTMLInputElement).setCustomValidity("");
                setName(e.target.value);
              }}
              onKeyDown={preventSubmit}
              minLength={1}
              maxLength={64}
              required
            />
            <div className="absolute right-1 top-0 flex h-9 items-center">
              <span className="text-xs text-subtext">{name.length}/64</span>
            </div>
          </div>
          <div className="w-8"></div>
        </div>
        <div className="flex w-full flex-row gap-x-2">
          <label className="w-16 self-center justify-self-end text-right" htmlFor="message">
            <span className="xs:inline-block hidden">Message</span>
            <span className="xs:hidden">Msg</span>
          </label>
          <div className="relative grow">
            <textarea
              id="message"
              className="flex max-h-40 min-h-9 w-full resize-none rounded-md border-none bg-secondary py-1 pl-3 pr-[3.25rem] shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary md:text-sm focus:[&:user-invalid]:ring-red-500"
              value={content}
              onChange={(e) => {
                (e.target as HTMLTextAreaElement).setCustomValidity("");
                setContent(e.target.value);
                if (!e.target.value.trim().length)
                  (e.target as HTMLTextAreaElement).setCustomValidity("Message can't be whitespace only.");
              }}
              minLength={1}
              maxLength={512}
              rows={Math.max(1, content.split("\n").length)}
              autoComplete="off"
              required
            />
            <div className="absolute right-1 top-0 flex h-9 items-center">
              <span className="text-xs text-subtext">{content.length}/512</span>
            </div>
          </div>
          <button className="w-8 transition-colors duration-150 active:text-accent">
            <SendHorizontal />
          </button>
        </div>
      </form>
      {error ? (
        <div className="mt-2 flex items-center justify-center">
          <CircleX className="mr-2 text-red-500" />
          <span>{error}</span>
        </div>
      ) : null}
    </>
  );
}
