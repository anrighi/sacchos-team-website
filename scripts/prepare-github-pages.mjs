import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "dist/client");
const index = join(root, "index.html");

if (!existsSync(index)) {
  throw new Error("dist/client/index.html missing — did vite build finish?");
}

copyFileSync(index, join(root, "404.html"));
writeFileSync(join(root, ".nojekyll"), "");
