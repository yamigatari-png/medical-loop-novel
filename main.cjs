const { app, BrowserWindow } = require("electron");
const path = require("path");

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: "#000000",
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setMenuBarVisibility(false);

  const indexPath = path.join(__dirname, "dist", "index.html");
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});