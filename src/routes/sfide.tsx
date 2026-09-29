import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/sfide")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
