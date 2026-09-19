"use client";

import { useState } from "react";
import { kitKind, portraitSvg, type KitKind } from "#/lib/portrait";
import type { Player } from "#/lib/player";
import { publicUrl } from "#/lib/public-url";
import { cn } from "#/lib/utils";

export function PlayerPortrait({
  player,
  kit,
  className,
}: {
  player: Player;
  kit?: KitKind;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const wanted = kit ?? kitKind(player.team);
  const source = portraitSource(player, wanted);

  if (source && !failed) {
    return (
      <img
        src={publicUrl(`/${source}`)}
        alt=""
        className={cn(
          "h-full w-full object-cover object-center pixel-art [image-rendering:pixelated]",
          className,
        )}
        onError={() => setFailed(true)}
      />
    );
  }

  const svg = portraitSvg(player, wanted).replace(/^<\?xml[^>]*>\s*/u, "");
  return (
    <div
      aria-hidden
      className={cn(
        "h-full w-full pixel-art [image-rendering:pixelated] [&_svg]:h-full [&_svg]:w-full",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function portraitSource(player: Player, kit: KitKind): string | undefined {
  if (player.photo?.endsWith(".png")) {
    return player.photo;
  }
  if (kit === kitKind(player.team)) {
    return player.photo;
  }
  return player.photoAlt;
}
