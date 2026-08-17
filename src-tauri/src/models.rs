use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum TrackType {
    Video,
    Audio,
    Text,
    Effect,
    Overlay,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum BlendMode {
    Normal,
    Multiply,
    Screen,
    Overlay,
    Darken,
    Lighten,
    ColorDodge,
    ColorBurn,
    HardLight,
    SoftLight,
    Difference,
    Exclusion,
    Hue,
    Saturation,
    Color,
    Luminosity,
}

impl Default for BlendMode {
    fn default() -> Self {
        BlendMode::Normal
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum EasingType {
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut,
    Bezier,
}

impl Default for EasingType {
    fn default() -> Self {
        EasingType::Linear
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum MaskType {
    None,
    Linear,
    Mirror,
    Radial,
    Rectangle,
    Pen,
}

impl Default for MaskType {
    fn default() -> Self {
        MaskType::None
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Resolution {
    pub width: u32,
    pub height: u32,
    pub aspect_ratio: String,
}

impl Default for Resolution {
    fn default() -> Self {
        Self {
            width: 1080,
            height: 1920,
            aspect_ratio: "9:16".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Transform {
    pub x: f64,
    pub y: f64,
    pub scale_x: f64,
    pub scale_y: f64,
    pub rotation: f64,
    pub opacity: f64,
    pub anchor_x: f64,
    pub anchor_y: f64,
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            scale_x: 1.0,
            scale_y: 1.0,
            rotation: 0.0,
            opacity: 1.0,
            anchor_x: 0.5,
            anchor_y: 0.5,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Keyframe {
    pub id: String,
    pub time: f64,
    pub property: String,
    pub value: serde_json::Value,
    pub easing: EasingType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub control_points: Option<[f64; 4]>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FilterEffect {
    pub id: String,
    #[serde(rename = "type")]
    pub effect_type: String,
    pub name: String,
    pub enabled: bool,
    pub intensity: f64,
    pub params: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AudioSettings {
    pub volume: f64,
    pub pitch: f64,
    pub speed: f64,
    pub fade_in: f64,
    pub fade_out: f64,
    pub pan: f64,
    pub is_muted: bool,
    pub noise_reduction: bool,
    pub voice_enhance: bool,
}

impl Default for AudioSettings {
    fn default() -> Self {
        Self {
            volume: 1.0,
            pitch: 1.0,
            speed: 1.0,
            fade_in: 0.0,
            fade_out: 0.0,
            pan: 0.0,
            is_muted: false,
            noise_reduction: false,
            voice_enhance: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Point2D {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Size2D {
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ClipMask {
    #[serde(rename = "type")]
    pub mask_type: MaskType,
    pub inverted: bool,
    pub feather: f64,
    pub position: Point2D,
    pub size: Size2D,
    pub rotation: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub points: Option<Vec<Point2D>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TextContent {
    pub text: String,
    pub font_family: String,
    pub font_size: f64,
    pub font_color: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stroke_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stroke_width: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub background_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub background_padding: Option<f64>,
    pub align: String,
    pub letter_spacing: f64,
    pub line_height: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub animation: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ClipTransition {
    #[serde(rename = "type")]
    pub transition_type: String,
    pub duration: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct MediaMetadata {
    pub id: String,
    pub name: String,
    pub path: String,
    pub mime_type: String,
    pub media_type: String,
    pub size: u64,
    pub duration: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fps: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub codec: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub audio_channels: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sample_rate: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bitrate: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail_uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnails: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub waveform: Option<Vec<f32>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub waveform_uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Clip {
    pub id: String,
    pub media_id: String,
    pub track_id: String,
    pub name: String,
    pub start_time: f64,
    pub duration: f64,
    pub source_start_time: f64,
    pub source_duration: f64,
    pub speed: f64,
    pub is_muted: bool,
    pub transform: Transform,
    pub blend_mode: BlendMode,
    pub keyframes: Vec<Keyframe>,
    pub effects: Vec<FilterEffect>,
    pub audio_settings: AudioSettings,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mask: Option<ClipMask>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text_content: Option<TextContent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transition_in: Option<ClipTransition>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transition_out: Option<ClipTransition>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color_label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub speed_curve: Option<serde_json::Value>,
    #[serde(default)]
    pub is_reversed: bool,
    #[serde(default)]
    pub preserve_pitch: bool,
    #[serde(default)]
    pub smooth_slow_motion: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Track {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub track_type: TrackType,
    pub is_muted: bool,
    pub is_locked: bool,
    pub is_hidden: bool,
    pub volume: f64,
    pub z_index: i32,
    pub clips: Vec<Clip>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Marker {
    pub id: String,
    pub time: f64,
    pub label: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ProjectMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub device: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub schema_version: String,
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
    pub resolution: Resolution,
    pub fps: u32,
    pub duration: f64,
    pub tracks: Vec<Track>,
    pub markers: Vec<Marker>,
    pub media_bin: Vec<MediaMetadata>,
    pub metadata: ProjectMetadata,
}
