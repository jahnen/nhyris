import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function installDependencies(projectPath) {
  process.chdir(projectPath);

  try {
    console.log("Installing standalone R...");
    const rShellScriptPath = path.join(__dirname, "r.sh");
    execSync(`sh "${rShellScriptPath}"`, { stdio: "inherit" });

    installRPackages();
    installNodePackages();
  } catch (err) {
    console.error("Setup or launch failed:", err.message);
    process.exit(1);
  }
}

export function installRPackages() {
  console.log("Installing R packages...");

  const pakPkgsPath = path.join(__dirname, "pak-pkgs.R");

  if (process.platform === "win32") {
    // Rscript path define
    const rscriptPath = path.join(process.cwd(), "r-win", "bin", "Rscript.exe");
    const rscriptCmd = `"${rscriptPath}" "${pakPkgsPath}"`;

    try {
      execSync(rscriptCmd, { stdio: "inherit" });
    } catch (err) {
      console.error("Failed to install R packages:", err.message);
      throw err;
    }
  } else {
    // For Linux and MacOS
    try {
      execSync(`Rscript "${pakPkgsPath}"`, { stdio: "inherit" });
    } catch (err) {
      console.error("Failed to install R packages:", err.message);
      throw err;
    }
  }
}

export function installNodePackages() {
  console.log("Installing Node packages...");
  try {
    execSync("npm install", { stdio: "inherit" });
  } catch (err) {
    console.error("Failed to install Node packages:", err.message);
    throw err;
  }
}
