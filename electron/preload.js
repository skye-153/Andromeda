const { contextBridge, shell } = require('electron');
const path = require('path');
const fs = require('fs');

contextBridge.exposeInMainWorld('electron', {
  shell: {
    openPath: (path) => shell.openPath(path),
  },
  // Expose a function to write a temporary file
  writeTempFile: (base64Content, originalFileName) => {
    return new Promise((resolve, reject) => {
      const tempDir = path.join(shell.app.getPath('temp'), 'andromeda_temp_files');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const filePath = path.join(tempDir, originalFileName);
      const buffer = Buffer.from(base64Content, 'base64');
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(filePath);
        }
      });
    });
  },
});