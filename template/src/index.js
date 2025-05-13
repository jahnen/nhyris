// Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn
// Copyright (c) 2025 Jinhwan Kim
const { app, session, BrowserWindow } = require("electron");
const { spawn, execSync } = require("child_process");
const path = require("path");

// Helpers

// run this as early in the main process as possible
// https://github.com/electron/windows-installer?tab=readme-ov-file#handling-squirrel-events
// https://www.electronforge.io/config/makers/squirrel.windows#handling-startup-events
try {
  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require("electron-squirrel-startup")) {
    app.quit();
    try {
      execSync("taskkill /IM Rterm.exe /F", { stdio: "ignore" });
      console.log("✅ Rterm.exe processes have been terminated.");
    } catch (err) {
      console.error("❌ Failed to terminate Rterm.exe processes:", err.message);
    }
  }
} catch (err) {
  console.log("ℹ️ 'electron-squirrel-startup' module is not available.");
}

const os = require("os");

const rPath = os.platform() === "win32" ? "r-win" : "r-mac";

// remove axios
const checkServerStatus = async (url) => {
  try {
    const res = await fetch(url, { method: "HEAD", timeout: 3000 });
    return res.status === 200;
  } catch (e) {
    console.error("Error checking server status:", e);
    return false;
  }
};

// remove execa
const startShinyProcess = () => {
  return new Promise((resolve, reject) => {
    const rShinyProcess = spawn(
      rscript,
      ["--vanilla", "-f", path.join(app.getAppPath(), "start-shiny.R")],
      {
        env: {
          WITHIN_ELECTRON: "1",
          RE_SHINY_PATH: shinyAppPath,
          R_LIB_PATHS: libPath,
          R_HOME_DIR: rpath,
          RHOME: rpath,
          RE_SHINY_PORT: 1124,
          R_LIBS: libPath,
          R_LIBS_USER: libPath,
          R_LIBS_SITE: libPath,
        },
        stdio: "ignore",
        // terminal output for debug
        // stdio: "inherit",
      }
    );

    rShinyProcess.on("error", (err) => {
      console.error("Shiny process failed:", err);
      reject(err);
    });

    rShinyProcess.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Shiny process exited with code ${code}`));
      }
    });

    resolve(rShinyProcess);
  });
};

const waitFor = (milliseconds) => {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, milliseconds);
  });
};

const rpath = path.join(app.getAppPath(), rPath);
const libPath = path.join(rpath, "library");

const rscript = path.join(rpath, "bin", "R");

const shinyAppPath = path.join(app.getAppPath(), "shiny");

const backgroundColor = "#2c3e50"; // electron

let shutdown = false;
let rShinyProcess = null;

const tryStartWebserver = async (
  attempt,
  progressCallback,
  onErrorStartup,
  onErrorLater,
  onSuccess
) => {
  if (attempt > 100) {
    await progressCallback({ attempt: attempt, code: "failed" });
    await onErrorStartup();
    return;
  }

  if (rShinyProcess !== null) {
    await onErrorStartup(); // should not happen
    return;
  }

  await progressCallback({ attempt: attempt, code: "start" });

  let shinyRunning = false;

  let shinyProcessAlreadyDead = false;

  try {
    rShinyProcess = await startShinyProcess();
  } catch (e) {
    shinyProcessAlreadyDead = true;
    console.error("Error starting Shiny process:", e);
  }

  let url = `http://127.0.0.1:1124`;
  for (let i = 0; i <= 10; i++) {
    if (shinyProcessAlreadyDead) {
      break;
    }
    await waitFor(1000);
    try {
      const serverUp = await checkServerStatus(url);
      if (serverUp) {
        await progressCallback({ attempt: attempt, code: "success" });
        shinyRunning = true;
        onSuccess(url);
        return;
      }
    } catch (e) {
      console.error("Error checking server status:", e);
    }
  }
  await progressCallback({ attempt: attempt, code: "notresponding" });

  try {
    rShinyProcess.kill();
  } catch (e) {
    console.error("Error killing Shiny process:", e);
  }
};

let mainWindow;
let loadingSplashScreen;
let errorSplashScreen;

const createWindow = (shinyUrl) => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    show: false,
    // icon: __dirname + '/favicon.ico',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(shinyUrl);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

const splashScreenOptions = {
  width: 1600,
  height: 900,
  backgroundColor: backgroundColor,
};

const createSplashScreen = (filename) => {
  let splashScreen = new BrowserWindow(splashScreenOptions);
  splashScreen.loadURL(`file://${__dirname}/${filename}.html`);
  splashScreen.on("closed", () => {
    splashScreen = null;
  });
  return splashScreen;
};

const createLoadingSplashScreen = () => {
  loadingSplashScreen = createSplashScreen("loading");
};

const createErrorScreen = () => {
  errorSplashScreen = createSplashScreen("failed");
};

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

  createLoadingSplashScreen();

  const emitSpashEvent = async (event, data) => {
    try {
      await loadingSplashScreen.webContents.send(event, data);
    } catch (e) {
      console.error("Error emitting splash event:", e);
    }
  };

  const progressCallback = async (event) => {
    await emitSpashEvent("start-webserver-event", event);
  };

  const onErrorLater = async () => {
    if (!mainWindow) {
      return;
    }
    createErrorScreen();
    await errorSplashScreen.show();
    mainWindow.destroy();
  };

  const onErrorStartup = async () => {
    await waitFor(10000); // TODO: hack, only emit if the loading screen is ready
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
        loadingSplashScreen.destroy();
        loadingSplashScreen = null;
        mainWindow.show();
      }
    );
  } catch (e) {
    console.error("Error starting webserver:", e);
    await emitSpashEvent("failed");
  }
});

app.on("window-all-closed", () => {
  shutdown = true;
  try {
    execSync("taskkill /IM Rterm.exe /F", { stdio: "ignore" });
    console.log("✅ Rterm.exe processes have been terminated.");
  } catch (err) {
    console.error("❌ Failed to terminate Rterm.exe processes:", err.message);
  }

  console.log("Shutting down...");
  try {
    rShinyProcess.kill();
  } catch (e) {
    console.error("Error killing Shiny process:", e);
  }
  app.quit();
});
