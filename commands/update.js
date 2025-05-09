import { Command } from "commander";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export const updateCommand = new Command("update")
  .argument("<name>", "Project name to update")
  .description("Update R and Node packages for the specified nhyris project")
  .action((name) => {
    const root = process.cwd();
    const projectPath = path.join(root, name);

    if (!fs.existsSync(projectPath)) {
      console.error(
        `❌ Project '${name}' does not exist in the current directory.`
      );
      process.exit(1);
    }

    process.chdir(projectPath);

    try {
      console.log(`📂 Updating project: ${name}`);

      console.log("📦 Installing R packages...");
      execSync("Rscript ./add-cran-binary-pkgs.R", { stdio: "inherit" });

      console.log("📦 Installing Node packages...");
      execSync("npm install", { stdio: "inherit" });

      console.log(`✅ Project '${name}' updated successfully.`);
    } catch (err) {
      console.error("❌ Update failed:", err.message);
      process.exit(1);
    } finally {
      process.chdir(root); // Return to the original directory
    }
  });
