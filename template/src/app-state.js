const path = require("path");
const os = require("os");
const { app } = require("electron");
const ProcessManager = require("./process-manager");

class AppState {
  constructor() {
    this.shutdown = false;
    this.rShinyProcess = null;
    this.mainWindow = null;
    this.loadingSplashScreen = null;
    this.errorSplashScreen = null;

    // Configuration
    let rPath;
    if (os.platform() === "win32") {
      rPath = "r-win";
    } else if (os.platform() === "linux") {
      rPath = "r-linux";
    } else if (os.platform() === "darwin") {
      rPath = "r-mac";
    } else {
      rPath = "r-unknown";
    }

    this.config = {
      rPath: rPath,
      backgroundColor: "#2c3e50",
      serverPort: 1124,
      maxRetryAttempts: 100,
      serverCheckTimeout: 3000,
      serverStartTimeout: 10000,
      mainWindow: {
        width: 1600,
        height: 900,
      },
    };

    // Computed paths
    this.paths = {
      rpath: path.join(app.getAppPath(), this.config.rPath),
      get libPath() {
        return path.join(this.rpath, "library");
      },
      get rscript() {
        return path.join(this.rpath, "bin", "R");
      },
      shinyAppPath: path.join(app.getAppPath(), "shiny"),
    };
  }

  setShinyProcess(process) {
    this.rShinyProcess = process;
  }

  setMainWindow(window) {
    this.mainWindow = window;
  }

  setLoadingSplashScreen(screen) {
    this.loadingSplashScreen = screen;
  }

  setErrorSplashScreen(screen) {
    this.errorSplashScreen = screen;
  }

  setShutdown(value) {
    this.shutdown = value;
  }

  getServerUrl() {
    return `http://127.0.0.1:${this.config.serverPort}`;
  }

  async cleanup() {
    this.shutdown = true;

    if (this.rShinyProcess) {
      await ProcessManager.killProcess(this.rShinyProcess, "ShinyProcess");
      this.rShinyProcess = null;
    }

    // Clean up windows
    if (this.loadingSplashScreen && !this.loadingSplashScreen.isDestroyed()) {
      this.loadingSplashScreen.destroy();
    }

    if (this.errorSplashScreen && !this.errorSplashScreen.isDestroyed()) {
      this.errorSplashScreen.destroy();
    }
  }
}

module.exports = AppState;
