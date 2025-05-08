import { Command } from "commander";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const buildCommand = new Command("build")
  .argument("<name>", "Project name")
  .description("Build a nhyris app using Electron Forge")
  .action((name) => {
    const root = process.cwd();
    const projectPath = path.join(root, name);

    if (!fs.existsSync(projectPath)) {
      console.error(`❌ Directory '${name}' does not exist.`);
      process.exit(1);
    }

    process.chdir(projectPath);

    try {
      console.log("📦 Building Electron app...");
      execSync("npx electron-forge make", { stdio: "inherit" });
    } catch (err) {
      console.error("❌ Build failed:", err.message);
      process.exit(1);
    }

    process.chdir(root);
    console.log(`✅ '${name}' build complete.`);
  });
