import fs from "fs";

export async function handleDirectory(projectPath, name, overwrite) {
  if (fs.existsSync(projectPath)) {
    if (!overwrite) {
      console.log(`'${name}' already exists. Use -w to overwrite.`);
      process.exit(1);
    } else {
      console.log(`Overwriting existing directory: ${name}`);
      fs.rmSync(projectPath, { recursive: true, force: true });

      let retries = 5;
      while (fs.existsSync(projectPath) && retries > 0) {
        console.log("Waiting for directory to be fully removed...");
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries--;
      }
    }
  }

  fs.mkdirSync(projectPath);
  console.log(`Created project: ${name}`);
}
