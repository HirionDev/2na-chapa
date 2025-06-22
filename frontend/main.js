const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

// Configura um diretório de cache personalizado
app.setPath('cache', path.join(__dirname, 'electron-cache'));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  // Tenta carregar a porta correta do Vite
  const vitePort = process.env.VITE_PORT || 5173;
  win.loadURL(`http://localhost:${vitePort}`).catch((err) => {
    console.error('Erro ao carregar URL do Vite:', err);
    win.loadFile(path.join(__dirname, 'dist', 'index.html')).catch((err) => {
      console.error('Erro ao carregar dist/index.html:', err);
    });
  });

  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('show-notification', (event, { title, body }) => {
  new Notification({
    title,
    body,
    icon: path.join(__dirname, 'public', 'favicon.ico'),
  }).show();
});