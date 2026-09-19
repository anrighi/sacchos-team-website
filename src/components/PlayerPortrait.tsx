"use client";

import { useState } from "react";
import { portraitSvg } from "#/lib/portrait";
import type { Player } from "#/lib/player";
import { publicUrl } from "#/lib/public-url";
import { cn } from "#/lib/utils";

export function PlayerPortrait({
  player,
  className,
  backdrop = true,
}: {
  player: Player;
  className?: string;
  backdrop?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (backdrop && player.photo && !failed) {
    return (
      <img
        src={publicUrl(`/${player.photo}`)}
        alt=""
        className={cn("h-full w-full object-cover object-center", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  const svg = portraitSvg(player, { backdrop }).replace(/^<\?xml[^>]*>\s*/u, "");
  return (
    <div
      aria-hidden
      className={cn("h-full w-full [&_svg]:h-full [&_svg]:w-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
