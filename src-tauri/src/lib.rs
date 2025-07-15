mod commands;

use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileData {
    pub id: String,
    #[serde(rename = "originalName")]
    pub original_name: String,
    pub name: String,
    pub size: u64,
    #[serde(rename = "type")]
    pub file_type: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Node {
    pub id: String,
    pub position: Position,
    pub title: String,
    pub description: String,
    pub links: Vec<String>,
    pub files: Vec<FileData>,
    #[serde(rename = "isDone")]
    pub is_done: Option<bool>,
    #[serde(rename = "size")]
    pub size: Option<String>,
    #[serde(rename = "color")]
    pub color: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Connection {
    pub id: String,
    pub from: String,
    pub to: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MapData {
    pub id: String,
    pub name: String,
    pub nodes: Vec<Node>,
    pub connections: Vec<Connection>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub due_date: Option<String>,
    #[serde(rename = "isCompleted")]
    pub is_completed: bool,
    #[serde(rename = "isUndated")]
    pub is_undated: bool,
    pub importance: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppData {
    pub maps: Vec<MapData>,
    pub tasks: Vec<Task>,
}

pub struct AppState(pub Mutex<AppData>);

fn get_data_path(app_handle: &AppHandle) -> PathBuf {
    let path = app_handle.path().app_data_dir().unwrap();
    if !path.exists() {
        fs::create_dir_all(&path).unwrap();
    }
    path.join("andromeda.json")
}

fn read_data(app_handle: &AppHandle) -> AppData {
    let path = get_data_path(app_handle);
    if !path.exists() {
        let default_data = AppData {
            maps: vec![MapData {
                id: "1".to_string(),
                name: "Getting Started".to_string(),
                nodes: vec![
                    Node {
                        id: "node-1".to_string(),
                        title: "Welcome to Idea Map!".to_string(),
                        description: "This is your first node. You can edit it by clicking on it."
                            .to_string(),
                        position: Position { x: 100.0, y: 100.0 },
                        links: vec![],
                        files: vec![],
                        is_done: Some(false),
                        size: Some("100%".to_string()),
                        color: Some("#ffffff".to_string()),
                    },
                    Node {
                        id: "node-2".to_string(),
                        title: "Create Your Own Nodes".to_string(),
                        description: "Add more nodes to build your map. Click \"Add Node\" to start.".to_string(),
                        position: Position { x: 400.0, y: 250.0 },
                        links: vec![],
                        files: vec![],
                        is_done: Some(true),
                        size: Some("100%".to_string()),
                        color: Some("#ffffff".to_string()),
                    },
                ],
                connections: vec![Connection {
                    id: "conn-1".to_string(),
                    from: "node-1".to_string(),
                    to: "node-2".to_string(),
                }],
            }],
            tasks: vec![],
        };
        let mut file = File::create(&path).unwrap();
        file.write_all(serde_json::to_string_pretty(&default_data).unwrap().as_bytes())
            .unwrap();
        return default_data;
    }

    let file = File::open(path).unwrap();
    serde_json::from_reader(file).unwrap_or_else(|_| AppData { maps: vec![], tasks: vec![] })
}

fn write_data(app_handle: &AppHandle, data: &AppData) {
    let path = get_data_path(app_handle);
    let mut file = File::create(path).unwrap();
    file.write_all(serde_json::to_string_pretty(data).unwrap().as_bytes())
        .unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            let data = read_data(&app_handle);
            app.manage(AppState(Mutex::new(data)));
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::open_file_command,
            commands::get_app_cache_dir_command,
            commands::get_maps,
            commands::create_map,
            commands::get_map,
            commands::update_map,
            commands::delete_map,
            commands::rename_map,
            commands::get_tasks_command,
            commands::save_tasks_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
