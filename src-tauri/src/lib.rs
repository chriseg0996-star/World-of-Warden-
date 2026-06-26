#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if let Some(window) = app.get_webview_window("main") {
        let _ = window.maximize();
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running Wardenfall desktop");
}
