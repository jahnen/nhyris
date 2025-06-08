import fs from "fs";
import path from "path";
import { execSync } from "child_process";

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

// Download shiny-examples files corresponding to the example name into the shiny directory of the new project
function downloadExampleFromGithub(name, projectPath) {
  const targetDir = path.join(projectPath, "shiny");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const apiUrl = `https://api.github.com/repos/rstudio/shiny-examples/contents/${name}`;
  try {
    const res = execSync(`curl -s "${apiUrl}"`);
    const files = JSON.parse(res.toString())
      .filter((f) => f.download_url)
      .map((f) => f.download_url);
    files.forEach((fileUrl) => {
      const fileName = path.basename(fileUrl);
      const dest = path.join(targetDir, fileName);
      if (!fs.existsSync(dest)) {
        execSync(`wget -q -O "${dest}" "${fileUrl}"`);
        console.log(`Downloaded ${fileName} to ${dest}`);
      }
    });
  } catch (err) {
    console.warn(
      `Failed to download example files for ${name}: ${err.message}`
    );
  }
}

export function copyTemplates(templatePath, projectPath, name) {
  console.log("Copying templates...");

  // If the example name exists in gallery.json, download to shiny directory
  let downloadedFromGithub = false;
  if (Array.isArray(gallery) && gallery.includes(name)) {
    console.log(`Downloading example files for '${name}'...`);
    downloadExampleFromGithub(name, projectPath);
    downloadedFromGithub = true;
  }

  // Copy the src directory
  fs.cpSync(path.join(templatePath, "src"), path.join(projectPath, "src"), {
    recursive: true,
  });

  // Copy app.R (do not copy if downloaded from GitHub)
  const shinyPath = path.join(projectPath, "shiny");
  const fromPath = path.join(templatePath, "shiny", "app.R");
  const toPath = path.join(shinyPath, "app.R");

  if (!downloadedFromGithub) {
    // Ensure shiny directory exists (again, after src copy)
    if (!fs.existsSync(shinyPath)) {
      fs.mkdirSync(shinyPath, { recursive: true });
    }
    if (fs.existsSync(fromPath) && !fs.existsSync(toPath)) {
      try {
        fs.copyFileSync(fromPath, toPath);
      } catch (err) {
        console.error(`Error copying 'app.R' to 'app.R':`, err.message);
        throw err;
      }
    }
  }

  // Copy other template files
  const filesToCopy = ["package.json", "forge.config.js"];
  filesToCopy.forEach((file) => {
    const from = path.join(templatePath, file);
    const to = path.join(projectPath, file);
    if (fs.existsSync(from)) {
      try {
        fs.copyFileSync(from, to);
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
