import { createServerFn } from "@tanstack/react-start";
import { getRequestHost, getRequestProtocol } from "@tanstack/react-start/server";
import { club } from "#/lib/club";

export const getRequestOriginFn = createServerFn().handler(async () => {
  try {
    return `${getRequestProtocol()}://${getRequestHost()}`;
  } catch {
    return club.productionUrl;
  }
});

export type OgCard = "sfida" | "match";

export function ogImageMeta(origin: string, card: OgCard) {
  const url = `${origin}/brand/og-${card}.png`;
  return [
    { property: "og:image", content: url },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: url },
  ];
}
