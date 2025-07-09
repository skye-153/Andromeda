import { type FileData } from '@/lib/types';

interface TauriApi {
  shell: typeof import('@tauri-apps/api/shell');
  fs: typeof import('@tauri-apps/api/fs');
  path: typeof import('@tauri-apps/api/path');
}

let tauriApi: TauriApi | null = null;

async function getTauriApi(): Promise<TauriApi | null> {
  if (tauriApi) {
    return tauriApi;
  }

  if (typeof window !== 'undefined' && window.__TAURI__) {
    const shell = await import('@tauri-apps/api/' + 'shell');
    const fs = await import('@tauri-apps/api/' + 'fs');
    const path = await import('@tauri-apps/api/' + 'path');
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