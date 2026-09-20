import { analogHands, matchClock } from "#/lib/challenge/sim";
import { cn } from "#/lib/utils";

export function AnalogClock({ t, className }: { t: number; className?: string }) {
  const { period, periodLength, label } = matchClock(t);
  const { minuteDeg, secondDeg } = analogHands(t);
  const minuteCount = Math.max(1, Math.round(periodLength / 60));
  const ticks = Array.from({ length: minuteCount }, (_, i) => i);
  const labels = minuteCount >= 15 ? [5, 10, 15] : [minuteCount];

  return (
    <div className={cn("mx-auto flex w-28 flex-col items-center md:w-32", className)}>
      <svg viewBox="0 0 100 100" role="img" aria-label={label} className="size-full">
        <circle cx="50" cy="50" r="47" fill="#15202b" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" />
        <circle cx="50" cy="50" r="42.5" fill="none" stroke="rgba(248,103,165,0.28)" strokeWidth="0.8" />
        {ticks.map((tick) => {
          const major = minuteCount >= 15 ? tick % 5 === 0 : true;
          return (
            <line
              key={tick}
              x1="50"
              y1="10"
              x2="50"
              y2={major ? 17 : 14}
              stroke={major ? "#f867a5" : "rgba(255,255,255,0.45)"}
              strokeWidth={major ? 1.8 : 1}
              transform={`rotate(${(tick / minuteCount) * 360} 50 50)`}
            />
          );
        })}
        {labels.map((value) => {
          const minute = value === minuteCount ? 0 : value;
          const angle = ((minute / minuteCount) * 360 - 90) * (Math.PI / 180);
          const x = 50 + Math.cos(angle) * 26;
          const y = 50 + Math.sin(angle) * 26;
          return (
            <text
              key={value}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(244,241,234,0.85)"
              fontSize="7.5"
              fontWeight="600"
            >
              {value}
            </text>
          );
        })}
        <g transform={`rotate(${minuteDeg} 50 50)`}>
          <rect x="48.5" y="20" width="3" height="32" rx="1.5" fill="#f4f1ea" />
        </g>
        <g transform={`rotate(${secondDeg} 50 50)`}>
          <rect x="49.25" y="14" width="1.5" height="36" rx="0.75" fill="#f867a5" />
        </g>
        <circle cx="50" cy="50" r="3.4" fill="#f867a5" />
      </svg>
      <p className="mt-1 text-[11px] font-semibold tracking-[0.22em] text-white/70">{period}</p>
    </div>
  );
}
