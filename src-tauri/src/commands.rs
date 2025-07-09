use tauri::{command, AppHandle, Manager};
use tauri_plugin_opener::open_path;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileData {
    pub id: String,
    pub name: String,
    pub original_name: String,
    pub size: u64,
    pub file_type: String,
    pub content: String, // Base64 encoded content
}

#[command]
pub async fn open_file_command(file: FileData, app_handle: AppHandle) -> Result<(), String> {
    use std::fs;
    use base64::{engine::general_purpose, Engine as _};

    let app_cache_dir_path = app_handle.path().app_cache_dir().map_err(|e| e.to_string())?;
    let temp_dir_path = app_cache_dir_path.join("andromeda_temp_files");

    fs::create_dir_all(&temp_dir_path).map_err(|e| format!("Failed to create temp directory: {}", e))?;

    let temp_file_path = temp_dir_path.join(&file.original_name);

    let decoded_content = general_purpose::STANDARD.decode(&file.content).map_err(|e| format!("Failed to decode base64 content: {}", e))?;
    fs::write(&temp_file_path, decoded_content).map_err(|e| format!("Failed to write temp file: {}", e))?;

    open_path(temp_file_path.to_string_lossy().as_ref(), None::<&str>)
        .map_err(|e| format!("Failed to open file: {}", e))?;

    Ok(())
}

#[command]
pub async fn get_app_cache_dir_command(app_handle: AppHandle) -> Result<PathBuf, String> {
    app_handle.path().app_cache_dir()
        .map_err(|e| e.to_string())
}