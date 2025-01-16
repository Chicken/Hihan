import { StepBack, StepForward } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";

export function PageSelector({
  pages,
  page,
  setPage,
}: {
  pages: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  const [writing, setWriting] = useState<number | null>(null);
  const [writingValue, setWritingValue] = useState<number | null>(null);

  let buttons: (number | null)[] = [];
  if (pages <= 5) {
    buttons = Array(pages)
      .fill(0)
      .map((_, i) => i + 1);
  } else {
    if (page <= 3) buttons = [1, 2, 3, null, pages];
    else if (page >= pages - 2) buttons = [1, null, pages - 2, pages - 1, pages];
    else buttons = [1, null, page, null, pages];
  }

  return (
    <div className="flex w-full flex-row justify-center gap-3">
      <button
        className="h-6 w-6 items-center justify-center rounded-full bg-secondary p-0.5 hover:saturate-200 disabled:text-subtext disabled:hover:cursor-not-allowed"
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
      >
        <StepBack className="h-full w-full" />
      </button>
      {buttons.map((n, i) => (
        <button
          key={i}
          data-active={page === n}
          data-writing={i === writing}
          className="overflow-hide flex h-6 w-6 items-center justify-center rounded-full bg-secondary data-[writing=true]:w-auto data-[writing=true]:rounded-md data-[active=true]:bg-primary data-[writing=false]:hover:saturate-200"
          onClick={() => {
            if (n == null) {
              setWriting(i);
              setTimeout(() => document.getElementById("page-selector-btn-" + i)?.focus(), 5);
              return;
            }
            setPage(n);
          }}
        >
          <input
            id={"page-selector-btn-" + i}
            data-visible={writing === i}
            className="h-full w-12 min-w-0 rounded-md border-none bg-transparent p-1 text-text focus:outline-none focus:ring-1 focus:ring-primary data-[visible=false]:hidden"
            type="text"
            pattern="([1-9]\d*)?"
            value={writingValue ?? ""}
            onBlur={() => {
              setWritingValue(null);
              setWriting(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (writingValue != null && (writingValue < 1 || writingValue > pages)) {
                  e.preventDefault();
                  return;
                }
                if (writingValue) setPage(writingValue);
                setWritingValue(null);
                setWriting(null);
              }
            }}
            onChange={(e) => {
              if (e.target.value === "") setWritingValue(null);
              const number = parseInt(e.target.value);
              if (!isNaN(number)) setWritingValue(number);
            }}
          />
          <span data-visible={writing !== i} className="data-[visible=false]:hidden">
            {n ?? "..."}
          </span>
        </button>
      ))}
      <button
        className="h-6 w-6 items-center justify-center rounded-full bg-secondary p-0.5 hover:saturate-200 disabled:text-subtext disabled:hover:cursor-not-allowed"
        disabled={page === pages}
        onClick={() => setPage((p) => p + 1)}
      >
        <StepForward className="h-full w-full" />
      </button>
    </div>
  );
}
