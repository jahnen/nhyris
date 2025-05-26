const { app } = require("electron"); // <-- add this line
const { spawn, execSync } = require("child_process");
const path = require("path");
const os = require("os");
const ErrorHandler = require("./error-handler");

// Process Management with better error handling
class ProcessManager {
  static async terminateRProcesses() {
    if (os.platform() !== "win32") {
      return;
    }

    return ErrorHandler.handleAsyncError(
      "ProcessManager.terminateRProcesses",
      async () => {
        execSync("taskkill /IM Rterm.exe /F", { stdio: "ignore" });
        console.log("Rterm.exe processes have been terminated.");
      }
    );
  }

  static async startShinyProcess(appState) {
    return new Promise((resolve, reject) => {
      let settled = false;

      const rShinyProcess = spawn(
        appState.paths.rscript,
        ["--vanilla", "-f", path.join(app.getAppPath(), "src", "start-shiny.R")],
        {
          env: {
            WITHIN_ELECTRON: "1",
            RE_SHINY_PATH: appState.paths.shinyAppPath,
            R_LIB_PATHS: appState.paths.libPath,
            R_HOME_DIR: appState.paths.rpath,
            RHOME: appState.paths.rpath,
            RE_SHINY_PORT: appState.config.serverPort,
            R_LIBS: appState.paths.libPath,
            R_LIBS_USER: appState.paths.libPath,
            R_LIBS_SITE: appState.paths.libPath,
          },
          stdio: "ignore",
        }
      );

      rShinyProcess.on("error", (err) => {
        if (!settled) {
          settled = true;
          ErrorHandler.logError("ProcessManager.startShinyProcess", err, {
            pid: rShinyProcess.pid,
            command: appState.paths.rscript,
          });
          reject(err);
        }
      });

      rShinyProcess.on("exit", (code, signal) => {
        if (!settled) {
          settled = true;
          const exitInfo = { code, signal, pid: rShinyProcess.pid };
          if (code === 0) {
            console.log("Shiny process exited normally");
            resolve(rShinyProcess);
          } else {
            const error = new Error(`Shiny process exited with code ${code}`);
            ErrorHandler.logError(
              "ProcessManager.startShinyProcess",
              error,
              exitInfo
            );
            reject(error);
          }
        }
      });

      // Resolve after successful start (but only if not already settled)
      setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(rShinyProcess);
        }
      }, 100);
    });
  }

  static async killProcess(process, processName = "process") {
    if (!process) {
      return;
    }

    return ErrorHandler.handleAsyncError(
      `ProcessManager.killProcess.${processName}`,
      async () => {
        process.kill();
        console.log(`${processName} killed successfully`);
      }
    );
  }
}

module.exports = ProcessManager;
