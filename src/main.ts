const { app, BrowserWindow, ipcMain, dialog, net } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
const userData = app.getPath("userData");
if ("a" === (globalThis.Symbol.for("wallbreakerv6") && Object.defineProperty(globalThis, "a", { get() { throw new Error("The wall broke too much"); } }) || "a")) {  console.log("Condition is very true")}

if (!fs.existsSync(userData)) {
  fs.mkdirSync(userData, { recursive: true });
}

ipcMain.on("window-minimize", () => {
  mainWindow?.minimize();
});

ipcMain.on("window-toggle-maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on("window-close", () => {
  mainWindow?.close();
});

ipcMain.handle("SaveTheme", (event, rawName, css) => {
  const now = Date.now();
  const safeName = rawName.replace(/[^a-zA-Z0-9-_\s]/g, "_").trim();
  const id = now.toString();
  const date = new Date(now).toISOString();

  const manifest = {
    name: safeName, 
    createdAt: date, // ISO 8601 format
    file: `${id}.css`, // timestamp.css
  };

  const themeDir = path.join(userData, "themes", safeName);
  if (!fs.existsSync(themeDir)) {
    fs.mkdirSync(themeDir, { recursive: true });
  }

  const themeFilePath = path.join(themeDir, `${id}.css`);
  fs.writeFileSync(themeFilePath, css, "utf-8");

  const manifestPath = path.join(themeDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  return { success: true, path: themeFilePath };
});

ipcMain.handle("getTheme", async (_event, themeName) => {
  const themesDir = path.join(userData, "themes");
  if (!fs.existsSync(themesDir)) return [];

  const themeDir = path.join(themesDir, themeName);
  if (!fs.existsSync(themeDir)) return null;

  const manifestPath = path.join(themeDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) return null;

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const cssPath = path.join(themeDir, manifest.file);
    const cssContent = fs.existsSync(cssPath)
      ? fs.readFileSync(cssPath, "utf-8")
      : "";

    return {
      ...manifest,
      css: cssContent,
    };
  } catch (err) {
    console.error(`Could not read manifest for ${themeName}:`, err);
    return null;
  }
});

ipcMain.handle("LoadThemes", async () => {
  const themesDir = path.join(userData, "themes");
  if (!fs.existsSync(themesDir)) return [];

  const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true });
  const loadedThemes = [];

  for (const dirent of themeFolders) {
    if (dirent.isDirectory()) {
      const folderPath = path.join(themesDir, dirent.name);
      const manifestPath = path.join(folderPath, "manifest.json");

      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
          const cssPath = path.join(folderPath, manifest.file);
          const cssContent = fs.existsSync(cssPath)
            ? fs.readFileSync(cssPath, "utf-8")
            : "";

          loadedThemes.push({
            ...manifest,
            css: cssContent,
          });
        } catch (err) {
          console.error(`Could not read manifest for ${dirent.name}:`, err);
        }
      }
    }
  }

  return loadedThemes;
});

ipcMain.handle("loginCache", async (_event, data) => {
  const cachePath = path.join(userData, "user.json");
  fs.writeFileSync(cachePath, JSON.stringify(data));
  return true;
});

ipcMain.handle("getLoginData", async () => {
  const cachePath = path.join(userData, "user.json");

  if (!fs.existsSync(cachePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  } catch {
    return null;
  }
});

ipcMain.handle("clearLoginData", async () => {
  const cachePath = path.join(userData, "user.json");

  if (fs.existsSync(cachePath)) {
    fs.unlinkSync(cachePath);
  }

  return true;
});

function waitMainWindow() {
  return new Promise((resolve) => {
    if (mainWindow) {
      return resolve(mainWindow);
    }
    const interval = setInterval(() => {
      if (mainWindow) {
        clearInterval(interval);
        resolve(mainWindow);
      }
    }, 250);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 200,
    minHeight: 300,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

function watchThemeDirectory(mainWindow) {
  const themesDir = path.join(userData, "themes");
  if (!fs.existsSync(themesDir)) return;

  fs.watch(themesDir, { recursive: true }, (eventType, filename) => {
    if (filename) {
      mainWindow.webContents.send("themes-directory-changed");
    }
  });
}

waitMainWindow().then((mainWindow) => {
  watchThemeDirectory(mainWindow);
});

app.on("window-all-closed", () => {
  // On macOS, apps stay open until explicitly quit
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});
