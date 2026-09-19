import { cn } from "#/lib/utils";

export function ScalpoMark({
  spent,
  className,
}: {
  spent?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={cn("overflow-visible", className)}
      fill={spent ? "none" : "currentColor"}
      stroke="currentColor"
      strokeWidth="0.95"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4.15" y="1.05" width="3.7" height="2.15" rx="0.7" />
      <path d="M6 3.35 1.65 10.85 6 8.4 10.35 10.85Z" />
    </svg>
  );
}
