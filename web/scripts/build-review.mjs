import { cp, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const app = fileURLToPath(new URL("../", import.meta.url));
const output = fileURLToPath(new URL("../../react-preview/", import.meta.url));
execFileSync("npm", ["run", "build"], { cwd: app, stdio: "inherit" });
await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });
await cp(new URL("../dist/", import.meta.url), output, { recursive: true });
// No catalog, supplier image bytes, user records or credentials enter this bundle.
console.log("React review bundle written to react-preview/.");
