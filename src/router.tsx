import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function routerBasepath() {
  const base = import.meta.env.BASE_URL;
  if (base === "/") {
    return undefined;
  }
  return base.replace(/\/$/, "");
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    basepath: routerBasepath(),
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
