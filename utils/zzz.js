import fs from "fs";
import path from "path";

export function exitWithError(message) {
  console.error(`${message}`);
  process.exit(1);
}

export function updatePackageJson(projectPath, updates) {
  const packageJsonPath = path.join(projectPath, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.warn("package.json not found in the project directory.");
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  let updated = false;

  for (const [key, value] of Object.entries(updates)) {
    packageJson[key] = { ...packageJson[key], ...value };
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("Updated package.json.");
  }

  return updated;
}

export async function updateForgeConfig(projectPath, makerConfig) {
  const forgeConfigPath = path.join(projectPath, "forge.config.js");
  console.log("Updating forge.config.js...");

  try {
    const forgeConfigModule = await import(`file://${forgeConfigPath}`);
    const forgeConfig = forgeConfigModule.default;

    const existingMakerIndex = forgeConfig.makers.findIndex(
      (m) => m.name === makerConfig.name
    );

    if (existingMakerIndex > -1) {
      forgeConfig.makers[existingMakerIndex] = makerConfig;
      console.log(`Updated existing ${makerConfig.name} maker configuration.`);
    } else {
      forgeConfig.makers.push(makerConfig);
      console.log(`Added ${makerConfig.name} maker configuration.`);
    }

    const updatedConfigString = JSON.stringify(forgeConfig, null, 2).replace(
      /"([^(")"]+)":/g,
      "$1:"
    );

    fs.writeFileSync(
      forgeConfigPath,
      `module.exports = ${updatedConfigString};`
    );
    console.log("Updated forge.config.js.");
  } catch (err) {
    throw new Error(`Error loading forge.config.js: ${err.message}`);
  }
}

export function updateGitignore(root, name) {
  const gitignorePath = path.join(root, ".gitignore");

  try {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");

    if (!gitignoreContent.includes(`${name}/`)) {
      fs.appendFileSync(gitignorePath, `\n${name}/\n`);
      console.log(`Added '${name}/' to .gitignore`);
    }
  } catch (err) {
    console.error(`Failed to update .gitignore: ${err.message}`);
  }
}
