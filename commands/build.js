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
    if (options.maker === true) {
      console.error(
        "❌ Please specify a maker type after -m (e.g., dmg or zip)."
      );
      process.exit(1);
    }

    process.chdir(projectPath);

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
            name: "nhyris installer",
            icon: "icon.icns",
            overwrite: true,
            debug: true,
            format: "UDZO",
            /*
            // background: "icon.png",
            // iconSize: 80,
            // windowPositionOptions: { x: 100, y: 100 },
            // windowSizeOptions: { width: 1000, height: 1000 },
            contents: [
              {
                x: 38,
                y: 100,
                type: "file",
                path: `${process.cwd()}/out/myapp-darwin-arm64/myapp.app`,
              },
              { x: 262, y: 100, type: "link", path: "/Applications" },
            ],
            */
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
