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
