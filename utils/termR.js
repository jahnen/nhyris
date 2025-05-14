import { execSync } from "child_process";

export function terminateRProcesses() {
  try {
    const rProcesses = execSync('tasklist | findstr "Rterm.exe"', {
      encoding: "utf-8",
    });
    if (rProcesses.trim()) {
      execSync("taskkill /IM Rterm.exe /F", { stdio: "ignore" });
    }
  } catch (err) {
    console.error("An error occurred:", err.message);
  }
}
