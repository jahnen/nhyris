import { Command } from "commander";
import path from "path";
import { handleDirectory } from "../utils/directory.js";
import { copyTemplates } from "../utils/template.js";
import { installDependencies, installStandaloneR } from "../utils/install.js";
import { updateGitignore } from "../utils/zzz.js";

export const initCommand = new Command("init")
  .argument("<name>", "Project name")
  .option("-w, --overwrite", "Overwrite if directory exists")
  .description("Initialize, install dependencies, and run a nhyris project")
  .action(async (name, options) => {
    const root = process.cwd();
    const projectPath = path.join(root, name);
    const templatePath = path.resolve("template");

    await handleDirectory(projectPath, name, options.overwrite);
    updateGitignore(root, name);
    copyTemplates(templatePath, projectPath, name);
    installStandaloneR(projectPath);
    installDependencies(projectPath);

    console.log(`Project '${name}' fully initialized.`);
    console.log(`run application using nhyris run ${name} command`);
    console.log("Please modify package.json as needed.");
  });
