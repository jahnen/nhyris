import { execSync } from "child_process";

export function installDependencies(projectPath) {
  process.chdir(projectPath);

  try {
    console.log("Installing standalone R...");
    execSync("sh ./r.sh", { stdio: "inherit" });

    installRPackages();
    installNodePackages();
  } catch (err) {
    console.error("Setup or launch failed:", err.message);
    process.exit(1);
  }
}

export function installRPackages() {
  console.log("Installing R packages...");
  try {
    if (process.platform !== "win32") {
      execSync("Rscript ./add-cran-binary-pkgs.R", { stdio: "inherit" });
    } else {
      console.log("Skipping R package installation on Windows.");
    }
  } catch (err) {
    console.error("Failed to install R packages:", err.message);
    throw err;
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
