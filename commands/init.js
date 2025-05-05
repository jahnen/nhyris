import { Command } from "commander";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const initCommand = new Command("init")
  .argument("<name>", "Project name")
  .option("-w, --overwrite", "Overwrite if directory exists")
  .description("Initialize, install dependencies, and run a nhyris project")
  .action(async (name, options) => {
    const root = process.cwd();
    const projectPath = path.join(root, name);
    const templatePath = path.resolve("template");

    if (fs.existsSync(projectPath)) {
      if (!options.overwrite) {
        console.log(`⚠️  '${name}' already exists. Use -w to overwrite.`);
        process.exit(1);
      } else {
        console.log(`🧨 Overwriting existing directory: ${name}`);
        fs.rmSync(projectPath, { recursive: true, force: true });

        let retries = 5;
        while (fs.existsSync(projectPath) && retries > 0) {
          console.log("⏳ Waiting for directory to be fully removed...");
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries--;
        }
      }
    }

    fs.mkdirSync(projectPath);
    console.log(`📁 Created project: ${name}`);

    const gitignorePath = path.join(root, ".gitignore");
    let gitignoreContent = "";

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    }

    if (!gitignoreContent.includes(`${name}/`)) {
      fs.appendFileSync(gitignorePath, `\n${name}/\n`);
      console.log(`✅ Added '${name}/' to .gitignore`);
    } else {
      console.log(`⚠️  '${name}/' already exists in .gitignore`);
    }

    console.log("📂 Copying templates...");
    execSync(`cp -r ${templatePath}/shiny ${projectPath}`);
    execSync(`cp -r ${templatePath}/src ${projectPath}`);

    const copy = (file) => {
      const from = path.join(templatePath, file);
      const to = path.join(projectPath, file);
      if (fs.existsSync(from)) {
        fs.copyFileSync(from, to);
      } else {
        console.warn(`⚠️  Missing template file: ${file}`);
      }
    };

    copy("package.json");
    copy("forge.config.js");
    copy("start-shiny.R");
    copy("r.sh");
    copy("add-cran-binary-pkgs.R");

    process.chdir(projectPath);

    try {
      console.log("📦 Installing standalone R...");
      execSync("sh ./r.sh", { stdio: "inherit" });

      console.log("📦 Installing R packages...");
      execSync("Rscript ./add-cran-binary-pkgs.R", { stdio: "inherit" });

      console.log("📦 Installing Node packages...");
      execSync("npm install", { stdio: "inherit" });

      console.log("🚀 Starting Electron app...");
      execSync("npx electron-forge start", { stdio: "inherit" });
    } catch (err) {
      console.error("❌ Setup or launch failed:", err.message);
      process.exit(1);
    }

    process.chdir(root);
    console.log(`✅ Project '${name}' fully initialized and running.`);
  });
