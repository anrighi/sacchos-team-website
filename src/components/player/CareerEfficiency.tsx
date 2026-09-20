"use client";

import { useEffect, useState } from "react";
import {
  careerOf,
  formatPct,
  formatSplit,
  loadDb,
  type EfficiencyRow,
} from "#/lib/challenge/efficiency";

export function CareerEfficiency({ slug }: { slug: string }) {
  const [row, setRow] = useState<EfficiencyRow | null>(null);

  useEffect(() => {
    setRow(careerOf(loadDb(window.localStorage), slug));
  }, [slug]);

  if (!row || (row.tentativi === 0 && row.shotsFaced === 0)) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h2 className="text-[15px] font-semibold tracking-tight text-white">Efficienza</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {row.tentativi > 0 ? (
          <Stat
            label="Tiri in porta"
            value={formatPct(row.efficienza)}
            detail={`${formatSplit(row.metas, row.tentativi)} mete`}
          />
        ) : null}
        {row.shotsFaced > 0 ? (
          <Stat
            label="Parate"
            value={formatPct(row.parate)}
            detail={`${formatSplit(row.impedite, row.shotsFaced)} tiri affrontati`}
          />
        ) : null}
      </dl>
      <p className="mt-3 text-[12px] text-white/40">
        Dalle sfide su questo dispositivo. L’archivio Sheet arriverà dopo.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div>
      <dt className="text-[15px] text-white/60">{label}</dt>
      <dd className="mt-1 flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-white/45">{detail}</span>
        <span className="font-display text-3xl leading-none text-pink">{value}</span>
      </dd>
    </div>
  );
}
