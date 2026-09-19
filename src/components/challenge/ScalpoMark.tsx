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
      viewBox="0 0 10 12"
      className={cn("overflow-visible", className)}
      fill={spent ? "none" : "currentColor"}
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="5" cy="2.15" r="1.45" />
      <path d="M1.4 4.05h7.2L5 11.05Z" />
    </svg>
  );
}
