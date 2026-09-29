"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { publicUrl } from "#/lib/public-url";
import { cn } from "#/lib/utils";

const RESET_MS = 2400;

function queryString(search: Record<string, string>): string {
  return Object.entries(search)
    .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%7E/g, "~")}`)
    .join("&");
}

export function ShareChallenge({
  ready,
  search,
  title,
  cta,
  hint,
  waiting,
  onMint,
}: {
  ready: boolean;
  search: Record<string, string>;
  title: string;
  cta: string;
  hint: string;
  waiting: string;
  onMint?: () => Promise<string | null>;
}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [href, setHref] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const longUrl = `${origin}${publicUrl("/sfida")}?${queryString(search)}`;
  const url = href || longUrl;
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const resolveUrl = async () => {
    if (href) {
      return href;
    }
    if (!onMint) {
      return longUrl;
    }
    try {
      const minted = await onMint();
      if (minted) {
        setHref(minted);
        return minted;
      }
    } catch {
      return longUrl;
    }
    return longUrl;
  };

  const share = async () => {
    const next = await resolveUrl();
    if (canShare) {
      try {
        await navigator.share({ title, url: next });
        return;
      } catch {
        // l'utente ha annullato: si ripiega sulla copia
      }
    }
    await write(next);
  };

  const copy = async () => {
    await write(await resolveUrl());
  };

  const write = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (!ready) {
    return (
      <p className="mt-8 rounded-[20px] border border-white/10 bg-white/4 px-5 py-6 text-center text-[15px] text-white/45">
        {waiting}
      </p>
    );
  }

  return (
    <div className="mt-8 rounded-[20px] border border-pink/25 bg-pink/8 p-5">
      <p className="font-display text-2xl leading-none tracking-tight text-white">{title}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-white/60">{hint}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={share}
          className={cn(
            "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors",
            copied ? "bg-white text-navy-deep" : "bg-pink text-navy-deep hover:bg-pink/90",
          )}
        >
          {copied ? <Check className="size-4" aria-hidden /> : null}
          {copied ? "Link copiato" : cta}
          {!copied && canShare ? <Share2 className="size-4" aria-hidden /> : null}
        </button>
        {canShare ? (
          <button
            type="button"
            onClick={copy}
            aria-label="Copia il link"
            className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <Copy className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <p className="mt-4 truncate text-[12px] text-white/30" title={url}>
        {url}
      </p>
    </div>
  );
}
