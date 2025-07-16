import { type FileData } from '@/lib/types';
import { invoke } from '@tauri-apps/api/core';
import * as shell from '@tauri-apps/api/shell';
import * as fs from '@tauri-apps/api/fs';
import * as path from '@tauri-apps/api/path';

interface TauriApi {
  shell: typeof shell;
  fs: typeof fs;
  path: typeof path;
}

let tauriApi: TauriApi | null = null;

async function getTauriApi(): Promise<TauriApi | null> {
  if (tauriApi) {
    return tauriApi;
  }

  if (typeof window !== 'undefined' && window.__TAURI__) {
    tauriApi = { shell, fs, path };
    return tauriApi;
  }
  return null;
}

export async function openFileInTauri(file: FileData, toast: any) {
  const api = await getTauriApi();
  if (!api) {
    console.warn("Not running in Tauri environment, cannot open file.");
    return;
  }

  try {
    const tempDir = await api.path.appCacheDir();
    const tempDirPath = `${tempDir}andromeda_temp_files`;
    await api.fs.createDir(tempDirPath, { recursive: true });
    const tempFilePath = `${tempDirPath}${api.path.sep}${file.originalName}`;
    await api.fs.writeBinaryFile(tempFilePath, Buffer.from(file.content, 'base64'));
    await api.shell.open(tempFilePath);
    toast({
      title: "File opened",
      description: `"${file.name}" opened with default application.`,
    });
  } catch (error) {
    console.error("Error opening file in Tauri:", error);
    toast({
      title: "Error opening file",
      description: "Could not open the file. Please try again. Check console for details.",
      variant: "destructive",
    });
  }
}
