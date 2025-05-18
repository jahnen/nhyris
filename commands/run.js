import { Command } from "commander";
import { execSync, exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

function terminateExecRProcesses() {
  exec('pgrep -f "nhyris/.*/exec/R"', (err, stdout) => {
    if (err) {
      if (err.code !== 1) {
        console.error(`Failed to execute pgrep: ${err.message}`);
      }
      return;
    }
    const pids = stdout.split("\n").filter(Boolean);
    pids.forEach((pid) => {
      try {
        process.kill(pid, "SIGTERM");
        console.log(`Sent SIGTERM to exec/R process (PID: ${pid})`);
        setTimeout(() => {
          try {
            process.kill(pid, 0);
            process.kill(pid, "SIGKILL");
            console.log(`Sent SIGKILL to exec/R process (PID: ${pid})`);
          } catch (e) {}
        }, 2000);
      } catch (e) {
        console.warn(`Failed to terminate PID ${pid}: ${e.message}`);
      }
    });
  });
}

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
      execSync("electron-forge start", { stdio: "inherit" });

      // Mac/Linux: exec/R 프로세스 종료
      if (os.platform() !== "win32") {
        terminateExecRProcesses();
      }
    } catch (err) {
      console.error("An error occurred:", err.message);
    }
    process.chdir(root);
  });
