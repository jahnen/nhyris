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

  if (process.platform === "win32") {
    // Rscript path define
    const rscriptPath = `${process.cwd()}\\r-win\\bin\\Rscript.exe`;
    const rscriptCmd = `"${rscriptPath}" ./pak-pkgs.R`; // 공백 추가

    try {
      execSync(rscriptCmd, { stdio: "inherit" });
    } catch (err) {
      console.error("Failed to install R packages:", err.message);
      throw err;
    }
  } else {
    // For Linux and MacOS
    try {
      execSync("Rscript ./pak-pkgs.R", { stdio: "inherit" });
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
