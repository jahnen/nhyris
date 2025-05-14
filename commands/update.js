import { Command } from "commander";
import path from "path";
import fs from "fs";
import { installRPackages, installNodePackages } from "../utils/install.js";

function validateProjectPath(projectPath, name) {
  if (!fs.existsSync(projectPath)) {
    console.error(`Project '${name}' does not exist in the current directory.`);
    process.exit(1);
  }
}

export const updateCommand = new Command("update")
  .argument("<name>", "Project name to update")
  .description("Update R and Node packages for the specified nhyris project")
  .action((name) => {
    const root = process.cwd();
    const projectPath = path.join(root, name);

    // Validate project path: to prevent wrong project name
    validateProjectPath(projectPath, name);

    process.chdir(projectPath);

    try {
      console.log(`Updating project: ${name}`);
      installRPackages(); // Use the function from install.js
      installNodePackages(); // Use the function from install.js
      console.log(`Project '${name}' updated successfully.`);
    } catch (err) {
      console.error("Update failed:", err.message);
      process.exit(1);
    } finally {
      process.chdir(root); // Return to the original directory
    }
  });
