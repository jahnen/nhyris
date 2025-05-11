import { Command } from "commander";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

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
      console.error(`❌ Directory '${name}' does not exist.`);
      process.exit(1);
    }

    const maker = options.maker;
    const supportedMakers = ["dmg", "zip"]; // Define supported makers
    if (options.maker === true || !supportedMakers.includes(maker)) {
      console.error(
        `❌ Invalid maker type specified: '${maker}'. Supported types are: ${supportedMakers.join(
          ", "
        )}.`
      );
      process.exit(1);
    }

    process.chdir(projectPath);

    if (maker === "dmg") {
      const backgroundSource = path.join(
        root,
        "template",
        "assets",
        "background-DMG.png"
      );
      const backgroundDestination = path.join(
        projectPath,
        "background-DMG.png"
      );

      if (!fs.existsSync(backgroundDestination)) {
        if (fs.existsSync(backgroundSource)) {
          fs.copyFileSync(backgroundSource, backgroundDestination);
          console.log("✅ Copied 'background-DMG.png' to project directory.");
        } else {
          console.warn("⚠️ 'background-DMG.png' not found in template/assets.");
        }
      } else {
        console.log(
          "ℹ️ 'background-DMG.png' already exists in the project directory."
        );
      }

      // Add @electron-forge/maker-dmg to devDependencies in package.json
      const packageJsonPath = path.join(projectPath, "package.json");
      let shouldInstallDependencies = false;

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf-8")
        );
        packageJson.devDependencies = packageJson.devDependencies || {};
        if (!packageJson.devDependencies["@electron-forge/maker-dmg"]) {
          packageJson.devDependencies["@electron-forge/maker-dmg"] = "^7.8.1";
          fs.writeFileSync(
            packageJsonPath,
            JSON.stringify(packageJson, null, 2)
          );
          console.log(
            "✅ Added '@electron-forge/maker-dmg' to devDependencies in package.json."
          );
          shouldInstallDependencies = true; // Mark that dependencies need to be installed
        } else {
          console.log(
            "ℹ️ '@electron-forge/maker-dmg' is already in devDependencies."
          );
        }
      } else {
        console.warn("⚠️ package.json not found in the project directory.");
      }

      // Run npm install if dependencies were updated
      if (shouldInstallDependencies) {
        try {
          console.log("📦 Installing updated dependencies...");
          execSync("npm install", { stdio: "inherit", cwd: projectPath });
          console.log("✅ Dependencies installed successfully.");
        } catch (err) {
          console.error("❌ Failed to install dependencies:", err.message);
          process.exit(1);
        }
      }
    }

    try {
      console.log(`📦 Building Electron app with maker: ${maker}...`);

      const forgeConfigPath = path.join(projectPath, "forge.config.js");
      console.log("🔧 Updating forge.config.js...");
      console.log("forgeConfigPath:", forgeConfigPath);

      try {
        const forgeConfigModule = await import(`file://${forgeConfigPath}`);
        const forgeConfig = forgeConfigModule.default;

        const dmgMakerConfig = {
          name: "@electron-forge/maker-dmg",
          config: {
            name: name,
            background: "background-DMG.png",
            icon: "icon.icns",
            iconSize: 200,
            format: "UDZO",
            contents: [
              {
                x: 140,
                y: 276,
                type: "file",
                path: `${process.cwd()}/out/${name}-darwin-arm64/${name}.app`,
              },
              { x: 518, y: 276, type: "link", path: "/Applications" },
            ],
          },
        };

        const existingDmgMakerIndex = forgeConfig.makers.findIndex(
          (m) => m.name === "@electron-forge/maker-dmg"
        );

        if (existingDmgMakerIndex > -1) {
          forgeConfig.makers[existingDmgMakerIndex] = dmgMakerConfig;
          console.log("ℹ️ Updated existing DMG maker configuration.");
        } else {
          forgeConfig.makers.push(dmgMakerConfig);
          console.log("✅ Added DMG maker configuration.");
        }

        let updatedConfigString = JSON.stringify(forgeConfig, null, 2);
        updatedConfigString = updatedConfigString.replace(
          /"([^(")"]+)":/g,
          "$1:"
        );

        fs.writeFileSync(
          forgeConfigPath,
          `module.exports = ${updatedConfigString};`
        );
        console.log("✅ Updated forge.config.js.");

        execSync("npx electron-forge make", { stdio: "inherit" });
      } catch (importError) {
        console.error("❌ Error loading forge.config.js:", importError);
        process.exit(1);
      }
    } catch (err) {
      console.error("❌ Build failed:", err.message);
      process.exit(1);
    }

    process.chdir(root);
    console.log(`✅ '${name}' build complete.`);
    console.log(`ℹ️ Check '${name}/out' directory.`);
  });
