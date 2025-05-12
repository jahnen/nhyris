import { Command } from "commander";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";


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


 try {
   if (os.platform() === "win32") { 
    console.log("🔍 Checking for running R.exe and Rterm.exe processes...");
    try {
      // Find and terminate R.exe processes
      const rProcesses = execSync('tasklist | findstr "Rterm.exe"', { encoding: "utf-8" });
      if (rProcesses.trim()) {
        // Terminate Rterm.exe processes
        execSync('taskkill /IM Rterm.exe /F', { stdio: "ignore" });
        console.log("✅ Rterm.exe processes have been terminated.");
      } else {
        console.log("ℹ️ No Rterm.exe processes are currently running.");
      }
    } catch (findErr) {
      console.log("ℹ️ No Rterm.exe processes found or findstr command failed.");
    }
   }    else{
        console.log("ℹ️ Skipping R process termination as the OS is not Windows.");

   }
} catch (err) {
  console.error("❌ Failed to terminate R processes:", err.message);
}
    process.chdir(root);    
  });
