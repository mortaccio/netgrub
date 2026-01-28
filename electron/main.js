const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const PORT = process.env.PORT || 3000;
let serverProc = null;

function startServer() {
  const serverPath = path.join(__dirname, "..", "server.js");
  serverProc = spawn(process.execPath, [serverPath], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", PORT: String(PORT) },
    stdio: "inherit",
  });
  serverProc.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`Server exited with code ${code}`);
    }
  });
}

function waitForServer(timeoutMs = 8000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const req = http.get(`http://localhost:${PORT}/ping`, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          clearInterval(timer);
          resolve();
        }
      });
      req.on("error", () => {
        if (Date.now() - started > timeoutMs) {
          clearInterval(timer);
          reject(new Error("Server not responding"));
        }
      });
      req.setTimeout(1000, () => req.destroy());
    }, 400);
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#0b0f14",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await waitForServer();
  await win.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProc) {
    serverProc.kill();
  }
});
