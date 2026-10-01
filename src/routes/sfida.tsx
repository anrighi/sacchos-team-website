import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sfida")({
  component: () => <Outlet />,
});
