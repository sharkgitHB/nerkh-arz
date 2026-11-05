// Electron main process - starts the Next.js standalone server and opens the app window
const { app, BrowserWindow, shell, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

// Auto-update (electron-updater). Loaded lazily: if the app was built without
// publish config there is no app-update.yml and checks are skipped safely.
let electronUpdater = null;
try {
  electronUpdater = require("electron-updater");
} catch {
  /* electron-updater not installed - updates disabled */
}

// Use a fixed high port to avoid clashing with the dev server (3000)
const PORT = process.env.CURRENCY_APP_PORT || 37777;
const HOST = "127.0.0.1";

let serverProc = null;
let mainWindow = null;

// Single instance: a second launch just focuses the existing window
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function serverScriptPath() {
  if (!app.isPackaged) {
    return path.join(__dirname, "..", ".next", "standalone", "server.js");
  }
  // standalone bundle is copied to resources/app-server by electron-builder
  return path.join(process.resourcesPath, "app-server", "server.js");
}

function startServer() {
  // Run the standalone Next.js server with Electron's built-in Node runtime
  const proc = spawn(process.execPath, [serverScriptPath()], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(PORT),
      HOSTNAME: HOST,
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  proc.stdout.on("data", () => {});
  proc.stderr.on("data", (d) => {
    console.error(`[server] ${d}`);
  });
  proc.on("exit", (code) => {
    console.error(`[server] exited with code ${code}`);
  });
  return proc;
}

function waitForServer(retries = 60, delayMs = 500) {
  const url = `http://${HOST}:${PORT}`;
  return new Promise((resolve, reject) => {
    const attempt = (left) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (left <= 0) return reject(new Error("Server did not start"));
        setTimeout(() => attempt(left - 1), delayMs);
      });
    };
    attempt(retries);
  });
}

function sendToWindow(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

function initAutoUpdate() {
  if (!app.isPackaged || !electronUpdater) return;
  const { autoUpdater } = electronUpdater;
  // Download silently in the background; install on demand (user confirms)
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) =>
    sendToWindow("update:message", { type: "available", version: info.version }),
  );
  autoUpdater.on("download-progress", (p) =>
    sendToWindow("update:message", {
      type: "progress",
      percent: Math.round(p.percent),
    }),
  );
  autoUpdater.on("update-downloaded", (info) =>
    sendToWindow("update:message", { type: "downloaded", version: info.version }),
  );
  autoUpdater.on("error", (e) => {
    console.error("[updater]", e ? e.message || e : e);
  });

  const check = () =>
    autoUpdater.checkForUpdates().catch((e) => {
      console.error("[updater] check failed:", e ? e.message || e : e);
    });

  check();
  // Re-check every 6 hours
  setInterval(check, 6 * 60 * 60 * 1000);
}

ipcMain.handle("update:install", () => {
  if (electronUpdater) {
    electronUpdater.autoUpdater.quitAndInstall();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 900,
    minWidth: 360,
    minHeight: 600,
    title: "نرخ ارز",
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in the system browser
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.loadURL(`http://${HOST}:${PORT}`);
}

app.whenReady().then(async () => {
  if (!gotLock) return;
  serverProc = startServer();
  try {
    await waitForServer();
  } catch (e) {
    console.error(e);
  }
  createWindow();
  initAutoUpdate();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (serverProc) {
    try {
      serverProc.kill();
    } catch {
      /* ignore */
    }
  }
});
