const { BrowserWindow } = require("electron");
const ErrorHandler = require("./error-handler");

// Create the main window for the Shiny app
function createWindow(appState, shinyUrl) {
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
}

// Options for splash screens
function getSplashScreenOptions(appState) {
  return {
    width: appState.config.mainWindow.width,
    height: appState.config.mainWindow.height,
    backgroundColor: appState.config.backgroundColor,
  };
}

// Create a splash screen window
function createSplashScreen(appState, filename) {
  const splashScreenOptions = getSplashScreenOptions(appState);
  let splashScreen = new BrowserWindow(splashScreenOptions);
  splashScreen.loadURL(`file://${__dirname}/${filename}.html`);
  splashScreen.on("closed", () => {
    splashScreen = null;
  });
  return splashScreen;
}

// Show loading splash screen
function createLoadingSplashScreen(appState) {
  const loadingSplashScreen = createSplashScreen(appState, "loading");
  appState.setLoadingSplashScreen(loadingSplashScreen);
}

// Show error splash screen
function createErrorScreen(appState) {
  const errorSplashScreen = createSplashScreen(appState, "failed");
  appState.setErrorSplashScreen(errorSplashScreen);
}

module.exports = {
  createWindow,
  createSplashScreen,
  createLoadingSplashScreen,
  createErrorScreen,
};
