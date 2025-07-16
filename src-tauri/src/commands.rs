use super::{write_maps_data, write_calendar_data, AppState, Connection, MapData, Node, Task, NewTask};
use tauri::{command, AppHandle, Manager, State};
use tauri_plugin_opener::open_path;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use uuid;

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

#[command]
pub fn get_maps(state: State<AppState>) -> Result<Vec<MapData>, String> {
    let data = state.0.lock().unwrap();
    Ok(data.maps.clone())
}

#[command]
pub fn create_map(name: String, state: State<AppState>, app_handle: AppHandle) -> Result<MapData, String> {
    let mut data = state.0.lock().unwrap();
    let new_map = MapData {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        nodes: vec![],
        connections: vec![],
    };
    data.maps.push(new_map.clone());
    write_maps_data(&app_handle, &data.maps);
    Ok(new_map)
}

#[command]
pub fn get_map(id: String, state: State<AppState>) -> Result<Option<MapData>, String> {
    let data = state.0.lock().unwrap();
    Ok(data.maps.iter().find(|m| m.id == id).cloned())
}

#[command]
pub fn update_map(
    id: String,
    nodes: Vec<Node>,
    connections: Vec<Connection>,
    state: State<AppState>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut data = state.0.lock().unwrap();
    if let Some(map) = data.maps.iter_mut().find(|m| m.id == id) {
        map.nodes = nodes;
        map.connections = connections;
        write_maps_data(&app_handle, &data.maps);
        Ok(())
    } else {
        Err("Map not found".to_string())
    }
}

#[command]
pub fn delete_map(id: String, state: State<AppState>, app_handle: AppHandle) -> Result<(), String> {
    let mut data = state.0.lock().unwrap();
    data.maps.retain(|m| m.id != id);
    write_maps_data(&app_handle, &data.maps);
    Ok(())
}

#[command]
pub fn rename_map(
    id: String,
    new_name: String,
    state: State<AppState>,
    app_handle: AppHandle,
) -> Result<MapData, String> {
    let mut data = state.0.lock().unwrap();
    if let Some(map) = data.maps.iter_mut().find(|m| m.id == id) {
        map.name = new_name;
        let map_clone = map.clone();
        write_maps_data(&app_handle, &data.maps);
        Ok(map_clone)
    } else {
        Err("Map not found".to_string())
    }
}

#[command]
pub fn get_tasks_command(state: State<AppState>) -> Result<Vec<Task>, String> {
    let data = state.0.lock().unwrap();
    Ok(data.tasks.clone())
}

#[command]
pub fn save_tasks_command(tasks: Vec<Task>, state: State<AppState>, app_handle: AppHandle) -> Result<(), String> {
    let mut data = state.0.lock().unwrap();
    data.tasks = tasks;
    write_calendar_data(&app_handle, &data.tasks);
    Ok(())
}

#[command]
pub fn get_all_calendar_events_command(state: State<AppState>) -> Result<Vec<Task>, String> {
    let data = state.0.lock().unwrap();
    Ok(data.tasks.clone())
}

#[command]
pub fn add_calendar_event_command(event: NewTask, state: State<AppState>, app_handle: AppHandle) -> Result<Task, String> {
    println!("Received new event: {:?}", event);
    let mut data = state.0.lock().unwrap();
    let new_event = Task {
        id: uuid::Uuid::new_v4().to_string(),
        title: event.title,
        description: event.description,
        due_date: event.due_date,
        is_completed: event.is_completed,
        is_undated: event.is_undated,
        importance: event.importance,
    };
    println!("Saving new event: {:?}", new_event);
    data.tasks.push(new_event.clone());
    write_calendar_data(&app_handle, &data.tasks);
    Ok(new_event)
}

#[command]
pub fn update_calendar_event_command(event: Task, state: State<AppState>, app_handle: AppHandle) -> Result<Task, String> {
    let mut data = state.0.lock().unwrap();
    if let Some(task) = data.tasks.iter_mut().find(|t| t.id == event.id) {
        *task = event.clone();
        write_calendar_data(&app_handle, &data.tasks);
        Ok(event)
    } else {
        Err("Event not found".to_string())
    }
}

#[command]
pub fn delete_calendar_event_command(id: String, state: State<AppState>, app_handle: AppHandle) -> Result<bool, String> {
    let mut data = state.0.lock().unwrap();
    let initial_len = data.tasks.len();
    data.tasks.retain(|t| t.id != id);
    write_calendar_data(&app_handle, &data.tasks);
    Ok(data.tasks.len() < initial_len)
}