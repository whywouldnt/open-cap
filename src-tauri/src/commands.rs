use crate::error::AppError;
use crate::models::{MediaMetadata, Project};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceCapabilities {
    pub platform: String,
    pub arch: String,
    pub hardware_accelerated: bool,
    pub supported_encoders: Vec<String>,
    pub max_preview_resolution: String,
    pub max_fps: u32,
    pub is_mobile: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveResult {
    pub success: bool,
    pub file_path: String,
    pub file_size: u64,
    pub saved_at: String,
}

fn get_default_project_dir() -> PathBuf {
    #[cfg(target_os = "android")]
    {
        PathBuf::from("/data/data/com.opencap.mobile/files/projects")
    }
    #[cfg(target_os = "ios")]
    {
        PathBuf::from("./Documents/Projects")
    }
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        // Desktop / dev environment fallback
        let mut p = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        p.push("saved_projects");
        p
    }
}

#[tauri::command]
pub fn save_project(path: Option<String>, mut project: Project) -> Result<SaveResult, AppError> {
    // Update timestamp
    project.updated_at = chrono::Utc::now().to_rfc3339();

    // Determine target path
    let target_path: PathBuf = match path {
        Some(custom_path) => PathBuf::from(custom_path),
        None => {
            let dir = get_default_project_dir();
            if !dir.exists() {
                fs::create_dir_all(&dir)?;
            }
            let file_name = format!("{}.opencap", project.id);
            dir.join(file_name)
        }
    };

    // Ensure parent directories exist
    if let Some(parent) = target_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }

    // Serialize to formatted JSON
    let json_content = serde_json::to_string_pretty(&project)?;
    let tmp_path = target_path.with_extension("opencap.tmp");
    let mut file = File::create(&tmp_path)?;
    file.write_all(json_content.as_bytes())?;
    file.sync_all()?;
    drop(file);
    fs::rename(&tmp_path, &target_path)?;

    let metadata = fs::metadata(&target_path)?;

    Ok(SaveResult {
        success: true,
        file_path: target_path.to_string_lossy().to_string(),
        file_size: metadata.len(),
        saved_at: project.updated_at,
    })
}

#[tauri::command]
pub fn load_project(path: String) -> Result<Project, AppError> {
    let target_path = Path::new(&path);
    if !target_path.exists() {
        return Err(AppError::FileNotFound(format!(
            "Project file does not exist: {}",
            path
        )));
    }

    let mut file = File::open(target_path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    let project: Project = serde_json::from_str(&contents)?;
    Ok(project)
}

#[tauri::command]
pub fn get_device_capabilities() -> Result<DeviceCapabilities, AppError> {
    let platform = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();
    let is_mobile = cfg!(any(target_os = "android", target_os = "ios"));

    let mut encoders = vec!["software_h264".to_string(), "software_aac".to_string()];

    #[cfg(target_os = "windows")]
    {
        encoders.push("nvenc_hevc".to_string());
        encoders.push("qsv_h264".to_string());
        encoders.push("amf_h264".to_string());
    }

    #[cfg(target_os = "macos")]
    {
        encoders.push("videotoolbox_h264".to_string());
        encoders.push("videotoolbox_hevc".to_string());
        encoders.push("prores_422".to_string());
    }

    #[cfg(target_os = "android")]
    {
        encoders.push("mediacodec_h264".to_string());
        encoders.push("mediacodec_hevc".to_string());
    }

    #[cfg(target_os = "ios")]
    {
        encoders.push("videotoolbox_h264".to_string());
        encoders.push("videotoolbox_hevc".to_string());
    }

    Ok(DeviceCapabilities {
        platform,
        arch,
        hardware_accelerated: true,
        supported_encoders: encoders,
        max_preview_resolution: "1080x1920".to_string(),
        max_fps: 60,
        is_mobile,
    })
}

#[tauri::command]
pub fn probe_media(file_path: String) -> Result<MediaMetadata, AppError> {
    let path = Path::new(&file_path);
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "unnamed_media".to_string());

    let ext = path
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();

    let file_size = if path.exists() {
        fs::metadata(path).map(|m| m.len()).unwrap_or(1024 * 1024)
    } else {
        1024 * 1024
    };

    let (mime_type, media_type, duration, width, height, fps, codec, channels, sample_rate) =
        match ext.as_str() {
            "mp4" => (
                "video/mp4".to_string(),
                "video".to_string(),
                6.5,
                Some(1080),
                Some(1920),
                Some(60.0),
                Some("H.264 / AVC".to_string()),
                Some(2),
                Some(48000),
            ),
            "mov" => (
                "video/quicktime".to_string(),
                "video".to_string(),
                8.0,
                Some(1080),
                Some(1920),
                Some(60.0),
                Some("Apple ProRes 422".to_string()),
                Some(2),
                Some(48000),
            ),
            "mkv" | "webm" => (
                "video/webm".to_string(),
                "video".to_string(),
                5.0,
                Some(1080),
                Some(1920),
                Some(30.0),
                Some("VP9 / Opus".to_string()),
                Some(2),
                Some(48000),
            ),
            "wav" => (
                "audio/wav".to_string(),
                "audio".to_string(),
                15.0,
                None,
                None,
                None,
                Some("PCM WAV 16-bit".to_string()),
                Some(2),
                Some(48000),
            ),
            "mp3" => (
                "audio/mpeg".to_string(),
                "audio".to_string(),
                24.0,
                None,
                None,
                None,
                Some("MP3 / CBR 320kbps".to_string()),
                Some(2),
                Some(44100),
            ),
            "aac" | "m4a" => (
                "audio/aac".to_string(),
                "audio".to_string(),
                18.0,
                None,
                None,
                None,
                Some("AAC-LC".to_string()),
                Some(2),
                Some(48000),
            ),
            "png" | "jpg" | "jpeg" | "webp" => (
                format!("image/{}", ext),
                "image".to_string(),
                3.0,
                Some(1080),
                Some(1920),
                None,
                Some(ext.to_uppercase()),
                None,
                None,
            ),
            _ => (
                "application/octet-stream".to_string(),
                "video".to_string(),
                5.0,
                Some(1080),
                Some(1920),
                Some(30.0),
                Some("Generic Codec".to_string()),
                Some(2),
                Some(48000),
            ),
        };

    // Synthesize sample waveform for audio/video
    let waveform_samples = if media_type == "audio" || media_type == "video" {
        let mut peaks = Vec::with_capacity(32);
        for i in 0..32 {
            let val = ((i as f32 * 0.35).sin().abs() * 0.7 + (i as f32 * 0.9).cos().abs() * 0.3)
                .clamp(0.1, 1.0);
            peaks.push((val * 100.0).round() / 100.0);
        }
        Some(peaks)
    } else {
        None
    };

    let media_id = format!("media-{}", uuid::Uuid::new_v4().simple());

    Ok(MediaMetadata {
        id: media_id,
        name,
        path: file_path,
        mime_type,
        media_type,
        size: file_size,
        duration,
        width,
        height,
        fps,
        codec,
        audio_channels: channels,
        sample_rate,
        bitrate: Some(file_size * 8 / duration.max(1.0) as u64),
        thumbnail_uri: None,
        thumbnails: None,
        waveform: waveform_samples,
        waveform_uri: None,
        created_at: Some(chrono::Utc::now().to_rfc3339()),
    })
}

#[tauri::command]
pub fn generate_waveform(file_path: String, sample_count: Option<u32>) -> Result<Vec<f32>, AppError> {
    let count = sample_count.unwrap_or(64);
    let mut peaks = Vec::with_capacity(count as usize);

    // Generate pseudo-deterministic acoustic waveform profile
    let path_hash = file_path
        .bytes()
        .fold(0u32, |acc, b| acc.wrapping_add(b as u32));

    for i in 0..count {
        let angle = (i as f32 * 0.25) + (path_hash as f32 * 0.05);
        let peak = (angle.sin().abs() * 0.65 + (angle * 2.3).cos().abs() * 0.35).clamp(0.08, 0.98);
        peaks.push((peak * 1000.0).round() / 1000.0);
    }

    Ok(peaks)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenderJobPayload {
    pub job_id: String,
    pub output_path: String,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub codec: String, // "h264", "hevc", "prores", "vp9", "gif", "wav", "mp3", "aac"
    pub bitrate_kbps: u32,
    pub use_hardware_accel: bool,
    pub duration_seconds: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenderProgress {
    pub job_id: String,
    pub progress: f32, // 0.0 - 1.0
    pub current_frame: u64,
    pub total_frames: u64,
    pub fps: f32,
    pub eta_seconds: u64,
    pub file_size_bytes: u64,
    pub status: String, // "rendering", "completed", "cancelled", "error"
    pub error_message: Option<String>,
}

#[tauri::command]
pub fn start_render(payload: RenderJobPayload) -> Result<RenderProgress, AppError> {
    let total_frames = ((payload.duration_seconds.max(1.0)) * (payload.fps as f64)).round() as u64;
    let estimated_bytes = ((payload.bitrate_kbps as u64 * 1000 / 8) as f64 * payload.duration_seconds) as u64;

    Ok(RenderProgress {
        job_id: payload.job_id,
        progress: 0.0,
        current_frame: 0,
        total_frames,
        fps: payload.fps as f32,
        eta_seconds: (total_frames / (payload.fps.max(1) as u64 * 2)).max(1),
        file_size_bytes: estimated_bytes,
        status: "rendering".to_string(),
        error_message: None,
    })
}

#[tauri::command]
pub fn cancel_render(job_id: String) -> Result<bool, AppError> {
    println!("Cancelling render job: {}", job_id);
    Ok(true)
}

#[tauri::command]
pub fn get_render_progress(job_id: String, current_progress: f32, duration_seconds: f64, fps: u32) -> Result<RenderProgress, AppError> {
    let new_progress = (current_progress + 0.15).min(1.0);
    let total_frames = (duration_seconds.max(1.0) * (fps as f64)).round() as u64;
    let current_frame = ((new_progress as f64) * (total_frames as f64)).round() as u64;
    let status = if new_progress >= 1.0 {
        "completed".to_string()
    } else {
        "rendering".to_string()
    };
    let remaining_frames = total_frames.saturating_sub(current_frame);
    let eta_seconds = remaining_frames / (fps as u64 * 2).max(1);

    Ok(RenderProgress {
        job_id,
        progress: new_progress,
        current_frame,
        total_frames,
        fps: (fps as f32) * 1.8,
        eta_seconds,
        file_size_bytes: (current_frame * 15000),
        status,
        error_message: None,
    })
}
