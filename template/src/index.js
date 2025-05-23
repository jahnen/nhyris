// Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn
// Copyright (c) 2025 Jinhwan Kim
const { app, session, BrowserWindow } = require("electron");
const path = require("path");
const os = require("os");
const ErrorHandler = require("./error-handler");
const ProcessManager = require("./process-manager"); // <-- import ProcessManager
const ServerUtils = require("./server-utils"); // 추가

// Application State Management with better error handling
class AppState {
  constructor() {
    this.shutdown = false;
    this.rShinyProcess = null;
    this.mainWindow = null;
    this.loadingSplashScreen = null;
    this.errorSplashScreen = null;

    // Configuration
    this.config = {
      rPath: os.platform() === "win32" ? "r-win" : "r-mac",
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

// Initialize global state
const appState = new AppState();

// 1. Start R process
async function startShinyProcessWithState(appState) {
  try {
    const rShinyProcess = await ProcessManager.startShinyProcess(appState);
    appState.setShinyProcess(rShinyProcess);
    return true;
  } catch (e) {
    ErrorHandler.logError("startShinyProcessWithState", e);
    return false;
  }
}

// 2. Check if server is ready
async function waitForServerReady(appState, strategy = "exponential") {
  const url = appState.getServerUrl();
  return await ServerUtils.waitForServerSmart(url, strategy);
}

// 3. Calculate retry delay
function getRetryDelay(attempt, base = 2000, factor = 1.5, max = 10000) {
  return Math.min(base * Math.pow(factor, attempt), max);
}

// 4. Terminate process and reset state
async function cleanupShinyProcess(appState) {
  await ProcessManager.killProcess(appState.rShinyProcess, "ShinyProcess");
  appState.setShinyProcess(null);
}

// 5. Main retry loop for starting webserver
async function tryStartWebserver(
  attempt,
  progressCallback,
  onErrorStartup,
  onErrorLater,
  onSuccess
) {
  if (attempt > appState.config.maxRetryAttempts) {
    await progressCallback({ attempt, code: "failed" });
    await onErrorStartup();
    return;
  }

  if (appState.rShinyProcess !== null) {
    await onErrorStartup();
    return;
  }

  await progressCallback({ attempt, code: "start" });

  const started = await startShinyProcessWithState(appState);
  if (!started) {
    await progressCallback({ attempt, code: "process_failed" });
    return tryStartWebserver(
      attempt + 1,
      progressCallback,
      onErrorStartup,
      onErrorLater,
      onSuccess
    );
  }

  const serverReady = await waitForServerReady(appState, "exponential");
  if (serverReady) {
    await progressCallback({ attempt, code: "success" });
    onSuccess(appState.getServerUrl());
    return;
  }

  await progressCallback({ attempt, code: "notresponding" });
  await cleanupShinyProcess(appState);

  const retryDelay = getRetryDelay(attempt);
  await ServerUtils.waitFor(retryDelay);

  return tryStartWebserver(
    attempt + 1,
    progressCallback,
    onErrorStartup,
    onErrorLater,
    onSuccess
  );
}

// Squirrel startup handling with better error handling
// Handle Squirrel startup only on Windows
const handleSquirrelStartup = () => {
  if (os.platform() !== "win32") {
    return false;
  }
  return ErrorHandler.handleSyncError(
    "handleSquirrelStartup",
    () => {
      if (require("electron-squirrel-startup")) {
        app.quit();
        ProcessManager.terminateRProcesses();
        return true;
      }
      return false;
    },
    false
  );
};

// Handle Squirrel events only on Windows
if (handleSquirrelStartup()) {
  // App is quitting due to squirrel event
  process.exit(0);
}

// Application bootstrap
app.on("ready", async () => {
  // Set a content security policy
  session.defaultSession.webRequest.onHeadersReceived((_, callback) => {
    callback({
      responseHeaders: `
        default-src 'none';
        script-src 'self';
        img-src 'self' data:;
        style-src 'self';
        font-src 'self';
    `,
    });
  });

  session.defaultSession.setPermissionRequestHandler((_1, _2, callback) => {
    callback(false);
  });

  // Create the main window for the Shiny app
  const createWindow = (shinyUrl) => {
    return ErrorHandler.handleSyncError("createWindow", () => {
      const mainWindow = new BrowserWindow({
        width: appState.config.mainWindow.width,
        height: appState.config.mainWindow.height,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      mainWindow.loadURL(shinyUrl);

      mainWindow.on("closed", () => {
        appState.setMainWindow(null);
      });

      mainWindow.on("unresponsive", () => {
        ErrorHandler.logError(
          "MainWindow",
          new Error("Window became unresponsive")
        );
      });

      appState.setMainWindow(mainWindow);
      return mainWindow;
    });
  };

  // Options for splash screens
  const splashScreenOptions = {
    width: appState.config.mainWindow.width,
    height: appState.config.mainWindow.height,
    backgroundColor: appState.config.backgroundColor,
  };

  // Create a splash screen window
  const createSplashScreen = (filename) => {
    let splashScreen = new BrowserWindow(splashScreenOptions);
    splashScreen.loadURL(`file://${__dirname}/${filename}.html`);
    splashScreen.on("closed", () => {
      splashScreen = null;
    });
    return splashScreen;
  };

  // Show loading splash screen
  const createLoadingSplashScreen = () => {
    const loadingSplashScreen = createSplashScreen("loading");
    appState.setLoadingSplashScreen(loadingSplashScreen);
  };

  // Show error splash screen
  const createErrorScreen = () => {
    const errorSplashScreen = createSplashScreen("failed");
    appState.setErrorSplashScreen(errorSplashScreen);
  };

  createLoadingSplashScreen();

  // Emit events to the splash screen
  const emitSpashEvent = async (event, data) => {
    try {
      await appState.loadingSplashScreen.webContents.send(event, data);
    } catch (e) {
      console.error("Error emitting splash event:", e);
    }
  };

  // Callback for progress updates
  const progressCallback = async (event) => {
    await emitSpashEvent("start-webserver-event", event);
  };

  // Callback for errors after startup
  const onErrorLater = async () => {
    if (!appState.mainWindow) {
      return;
    }
    createErrorScreen();
    await appState.errorSplashScreen.show();
    appState.mainWindow.destroy();
  };

  // Callback for errors during startup
  const onErrorStartup = async () => {
    await ServerUtils.waitFor(appState.config.serverStartTimeout); // TODO: hack, only emit if the loading screen is ready
    await emitSpashEvent("failed");
  };

  try {
    await tryStartWebserver(
      0,
      progressCallback,
      onErrorStartup,
      onErrorLater,
      (url) => {
        createWindow(url);
        appState.loadingSplashScreen.destroy();
        appState.setLoadingSplashScreen(null);
        appState.mainWindow.show();
      }
    );
  } catch (e) {
    console.error("Error starting webserver:", e);
    await emitSpashEvent("failed");
  }
});

app.on("window-all-closed", () => {
  appState.setShutdown(true);
  try {
    execSync("taskkill /IM Rterm.exe /F", { stdio: "ignore" });
    console.log("term.exe processes have been terminated.");
  } catch (err) {
    console.error("Failed to terminate Rterm.exe processes:", err.message);
  }

  console.log("Shutting down...");
  appState.cleanup();
  app.quit();
});
