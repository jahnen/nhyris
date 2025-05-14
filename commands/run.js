import { Command } from "commander";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { terminateRProcesses } from "../utils/termR.js";

export const runCommand = new Command("run")
  .argument("<app>", "The name of the app to run")
  .description("Run the specified nhyris app using Electron Forge")
  .action((app) => {
    const root = process.cwd();
    const appPath = path.join(root, app);
    if (!fs.existsSync(appPath)) {
      console.error(`Directory '${app}' does not exist.`);
      process.exit(1);
    }
    process.chdir(appPath);

    try {
      console.log("Starting Electron app...");
      execSync("npx electron-forge start", { stdio: "inherit" });

      // Check if OS is Windows before terminating R processes
      if (os.platform() === "win32") {
        terminateRProcesses();
      }
    } catch (err) {
      console.error("An error occurred:", err.message);
    }
    process.chdir(root);
  });
