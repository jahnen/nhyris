import fs from "fs";
import path from "path";

const gallery = JSON.parse(
  fs.readFileSync(new URL("../gallery.json", import.meta.url), "utf-8")
);

export function copyTemplates(templatePath, projectPath, name) {
  console.log("Copying templates...");

  const shinyPath = path.join(projectPath, "shiny");
  if (!fs.existsSync(shinyPath)) {
    fs.mkdirSync(shinyPath, { recursive: true });
    console.log("Created shiny directory.");
  }

  fs.cpSync(path.join(templatePath, "src"), path.join(projectPath, "src"), {
    recursive: true,
  });

  let fromPath, toPath;
  if (gallery[name]) {
    fromPath = path.join(templatePath, "shiny", gallery[name]);

    toPath = path.join(shinyPath, "app.R");
    if (fs.existsSync(fromPath)) {
      try {
        fs.copyFileSync(fromPath, toPath);
        console.log(`✅ Copied '${gallery[name]}' to 'app.R'`);
      } catch (err) {
        console.error(
          `❌ Error copying '${gallery[name]}' to 'app.R':`,
          err.message
        );
      }
    } else {
      console.warn(`⚠️  '${gallery[name]}' not found in the shiny directory.`);
    }
  } else {
    fromPath = path.join(shinyPath, "app.R");
    toPath = path.join(shinyPath, "app.R");
    if (fs.existsSync(fromPath)) {
      try {
        fs.copyFileSync(fromPath, toPath);
        console.log(`✅ Copied 'app.R' to 'app.R' (default)`);
      } catch (err) {
        console.error(`❌ Error copying 'app.R' to 'app.R':`, err.message);
      }
    } else {
      console.warn(`⚠️  'app.R' not found in the shiny directory.`);
    }
  }

  // Copy specific files
  const filesToCopy = [
    "package.json",
    "forge.config.js",
    "start-shiny.R",
    "r.sh",
    "add-cran-binary-pkgs.R",
    "icon.icns",
    "icon.ico",
    "icon.png",
  ];

  filesToCopy.forEach((file) => {
    const from = path.join(templatePath, file);
    const to = path.join(projectPath, file);
    if (fs.existsSync(from)) {
      fs.copyFileSync(from, to);
      console.log(`Copied '${file}' to project directory.`);
    } else {
      console.warn(`Missing template file: ${file}`);
    }
  });
}

export function copyFile(templatePath, projectPath, file) {
  const from = path.join(templatePath, file);
  const to = path.join(projectPath, file);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    console.log(`Copied '${file}' to project directory.`);
  } else {
    console.warn(`Missing template file: ${file}`);
  }
}
