import { Command } from "commander";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { exitWithError } from "../utils/zzz.js";
import { handleDmgMaker, handleSquirrelMaker } from "../utils/maker.js";

export const buildCommand = new Command("build")
  .argument("<name>", "Project name")
  .description("Build a nhyris app using Electron Forge")
  .option(
    "-m, --maker [maker]",
    "Specify the maker type (e.g., dmg or zip)",
    "zip"
  )
  .action(async (name, options) => {
    const root = process.cwd();
    const projectPath = path.join(root, name);

    if (!fs.existsSync(projectPath)) {
      return exitWithError(`Directory '${name}' does not exist.`);
    }

    const maker = options.maker;
    const supportedMakers = ["dmg", "zip", "squirrel"];
    if (!supportedMakers.includes(maker)) {
      return exitWithError(
        `Invalid maker type specified: '${maker}'. Supported types are: ${supportedMakers.join(
          ", "
        )}.`
      );
    }

    process.chdir(projectPath);

    try {
      if (maker === "dmg") {
        await handleDmgMaker(root, projectPath, name);
      } else if (maker === "squirrel") {
        await handleSquirrelMaker(root, projectPath);
      }

      console.log(`Building Electron app with maker: ${maker}...`);
      execSync("npx electron-forge make", { stdio: "inherit" });
      console.log(`'${name}' build complete.`);
      console.log(`Check '${name}/out' directory.`);
    } catch (err) {
      exitWithError(`Build failed: ${err.message}`);
    } finally {
      process.chdir(root);
    }
  });
