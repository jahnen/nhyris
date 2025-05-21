import fs from "fs";
import path from "path";

let gallery = {};
try {
  const galleryPath = new URL("../gallery.json", import.meta.url);
  const content = fs.readFileSync(galleryPath, "utf-8");
  gallery = JSON.parse(content);
} catch (err) {
  console.warn(
    `Failed to load or parse gallery.json: ${err.message}\nProceeding with an empty gallery.`
  );
}

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
        console.log(`Copied '${gallery[name]}' to 'app.R'`);
      } catch (err) {
        console.error(
          `Error copying '${gallery[name]}' to 'app.R':`,
          err.message
        );
        throw err;
      }
    } else {
      const msg = `'${gallery[name]}' not found in the shiny directory.`;
      console.warn(msg);
      throw new Error(msg);
    }
  } else {
    fromPath = path.join(templatePath, "shiny", "app.R");
    toPath = path.join(shinyPath, "app.R");
    if (fs.existsSync(fromPath)) {
      try {
        fs.copyFileSync(fromPath, toPath);
        console.log(`Copied 'app.R' to 'app.R' (default)`);
      } catch (err) {
        console.error(`Error copying 'app.R' to 'app.R':`, err.message);
        throw err;
      }
    } else {
      const msg = `'app.R' not found in the shiny directory.`;
      console.warn(msg);
      throw new Error(msg);
    }
  }

  const filesToCopy = [
    "package.json",
    "forge.config.js",
    "start-shiny.R",
    "r.sh",
    "pak-pkgs.R",
    "icon.icns",
    "icon.ico",
    "icon.png",
  ];

  filesToCopy.forEach((file) => {
    const from = path.join(templatePath, file);
    const to = path.join(projectPath, file);
    if (fs.existsSync(from)) {
      try {
        fs.copyFileSync(from, to);
        console.log(`Copied '${file}' to project directory.`);
      } catch (err) {
        console.error(`Error copying '${file}':`, err.message);
        throw err;
      }
    } else {
      const msg = `Missing template file: ${file}`;
      console.warn(msg);
      throw new Error(msg);
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
