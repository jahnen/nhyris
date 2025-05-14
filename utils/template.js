import fs from "fs";
import path from "path";

export function copyTemplates(templatePath, projectPath) {
  console.log("Copying templates...");

  // Copy directories
  fs.cpSync(path.join(templatePath, "shiny"), path.join(projectPath, "shiny"), {
    recursive: true,
  });
  fs.cpSync(path.join(templatePath, "src"), path.join(projectPath, "src"), {
    recursive: true,
  });

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
