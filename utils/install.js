import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function installDependencies(projectPath) {
  process.chdir(projectPath);

  try {    
    installRPackages();
    installNodePackages();
  } catch (err) {
    console.error("Setup or launch failed:", err.message);
    process.exit(1);
  }
}

export function installStandaloneR(projectPath) {
  console.log("Installing standalone R...");
  const rShellScriptPath = path.join(__dirname, "r.sh");
  execSync(`sh "${rShellScriptPath}"`, { stdio: "inherit", cwd: projectPath });
}

function runRscriptCommand(rscriptCmd, platformLabel = "") {
  try {
    execSync(rscriptCmd, { stdio: "inherit" });
  } catch (err) {
    console.error(
      `Failed to install R packages${
        platformLabel ? " on " + platformLabel : ""
      }:`,
      err.message
    );
    throw err;
  }
}

export function installRPackages() {
  console.log("Installing R packages...");

  const pakPkgsPath = path.join(__dirname, "pak-pkgs.R");
  let rscriptCmd, platformLabel;

  const rDir = "r-nhyris";

  if (process.platform === "win32") {
    const rscriptPath = path.join(process.cwd(), rDir, "bin", "Rscript.exe");
    rscriptCmd = `"${rscriptPath}" "${pakPkgsPath}"`;
    platformLabel = "Windows";
  } else if (process.platform === "linux") {
    const rscriptPath = path.join(process.cwd(), rDir, "bin", "Rscript");
    rscriptCmd = `"${rscriptPath}" "${pakPkgsPath}"`;
    platformLabel = "Linux";
  } else {
    // For MacOS and fallback
    rscriptCmd = `Rscript "${pakPkgsPath}"`;
    platformLabel = "macOS";
  }

  runRscriptCommand(rscriptCmd, platformLabel);
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
