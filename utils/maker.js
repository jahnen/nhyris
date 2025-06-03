import path from "path";
import fs from "fs";
import { installDependencies } from "./install.js";
import { updatePackageJson, updateForgeConfig } from "./zzz.js";

export async function handleDmgMaker(root, projectPath, name) {
  const backgroundSource = path.join(
    root,
    "template",
    "assets",
    "background-DMG.png"
  );
  const backgroundDestination = path.join(projectPath, "background-DMG.png");

  if (
    !fs.existsSync(backgroundDestination) &&
    fs.existsSync(backgroundSource)
  ) {
    fs.copyFileSync(backgroundSource, backgroundDestination);
    console.log("Copied 'background-DMG.png' to project directory.");
  }

  const dependenciesUpdated = updatePackageJson(projectPath, {
    devDependencies: { "@electron-forge/maker-dmg": "^7.8.1" },
  });

  if (dependenciesUpdated) {
    installDependencies(projectPath);
  }

  const arch = process.arch; // e.g., 'arm64' or 'x64'
  const platform = process.platform; // e.g., 'darwin'
  const appName = name; // passed as argument

  const dmgMakerConfig = {
    name: "@electron-forge/maker-dmg",
    config: {
      name: `${appName} installer`,
      background: "background-DMG.png",
      icon: "assets/icon.icns",
      // overwrite: true,
      // debug: true,
      iconSize: 200,
      format: "UDZO",
      // iconSize, windowPositionOptions, windowSizeOptions can be added as needed
      contents: [
        {
          x: 140,
          y: 276,
          type: "file",
          path: `${process.cwd()}/out/${appName}-${platform}-${arch}/${appName}.app`,
        },
        { x: 518, y: 276, type: "link", path: "/Applications" },
      ],
    },
  };

  await updateForgeConfig(projectPath, dmgMakerConfig);
}

export async function handleSquirrelMaker(root, projectPath) {
  const dependenciesUpdated = updatePackageJson(projectPath, {
    dependencies: { "electron-squirrel-startup": "^1.0.1" },
    devDependencies: { "@electron-forge/maker-squirrel": "^7.8.0" },
  });

  if (dependenciesUpdated) {
    installDependencies(projectPath);
  }

  const squirrelMakerConfig = {
    name: "@electron-forge/maker-squirrel",
    config: {
      setupIcon: "assets/setupIcon.ico",
      iconUrl:
        "https://github.com/jahnen/nhyris/raw/main/template/assets/icon.ico",
    },
  };

  await updateForgeConfig(projectPath, squirrelMakerConfig);
}
