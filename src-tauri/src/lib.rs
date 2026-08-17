pub mod commands;
pub mod error;
pub mod models;

use commands::{
    cancel_render, generate_waveform, get_device_capabilities, get_render_progress,
    load_project, probe_media, save_project, start_render,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            save_project,
            load_project,
            get_device_capabilities,
            probe_media,
            generate_waveform,
            start_render,
            cancel_render,
            get_render_progress
        ])
        .run(tauri::generate_context!())
        .expect("error while running OPEN-CAP Tauri application");
}
