import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const appDir = dirname(root);
const distDir = join(appDir, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await new Promise((resolve, reject) => {
  const child = spawn(process.platform === "win32" ? "tsc.cmd" : "tsc", ["-p", join(appDir, "tsconfig.build.json")], {
    cwd: appDir,
    stdio: "inherit",
    shell: false,
  });
  child.once("error", reject);
  child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`TypeScript build failed with exit code ${code}`)));
});

const index = await readFile(join(appDir, "index.html"), "utf8");
const productionIndex = index
  .replace('/src/main.ts', '/main.js')
  .replace(/<!-- BUILD:.*?-->/g, "");
await writeFile(join(distDir, "index.html"), productionIndex, "utf8");
await writeFile(join(distDir, ".gitignore"), "*\n!.gitignore\n", "utf8");
