import { Command } from "commander";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const runCommand = new Command("run")
  .argument("<app>", "The name of the app to run")
  .description("Run the specified nhyris app using Electron Forge")
  .action((app) => {
    const root = process.cwd();
    const appPath = path.join(root, app);

    if (!fs.existsSync(appPath)) {
      console.error(`❌ Directory '${app}' does not exist.`);
      process.exit(1);
    }

    process.chdir(appPath);

    try {
      console.log("🚀 Starting Electron app...");
      execSync("npx electron-forge start", { stdio: "inherit" });
    } catch (err) {
      console.error("❌ Failed to start the app:", err.message);
      process.exit(1);
    }

    process.chdir(root);
    console.log(`✅ '${app}' app has been started.`);
  });
