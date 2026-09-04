import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { SiteNav } from "#/components/SiteNav";
import { club } from "#/lib/club";
import appCss from "#/styles.css?url";
import type { ReactNode } from "react";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: `${club.name} — Scoutball` },
      {
        name: "description",
        content:
          "Rosa, carte e sfide dei Saccho's Team. AGESCI Pesaro 1, since 2016.",
      },
      { name: "theme-color", content: club.colors.navy },
      { property: "og:title", content: `${club.name} — Scoutball` },
      {
        property: "og:description",
        content: "Scoutball 7 vs 7. Rosa illustrata e sfide tra amici.",
      },
      { property: "og:url", content: club.productionUrl },
      { property: "og:locale", content: "it_IT" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.jpg", type: "image/jpeg" },
      { rel: "apple-touch-icon", href: "/brand/logo-sacchos.jpg" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <head>
        <HeadContent />
      </head>
      <body className="bg-navy-deep text-white antialiased">
        <SiteNav />
        <div className="min-h-dvh pb-24 pt-0 md:pb-8 md:pt-16">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
