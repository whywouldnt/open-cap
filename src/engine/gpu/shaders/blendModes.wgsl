// =============================================================
// OPEN-CAP WebGPU WGSL — 37+ Blend Modes Shader Library
// =============================================================

// Helper: RGB to Luminance
fn rgb_to_luminance(c: vec3<f32>) -> f32 {
    return dot(c, vec3<f32>(0.2126, 0.7152, 0.0722));
}

// 1. Normal
fn blend_normal(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let final_rgb = mix(base.rgb, blend.rgb, blend.a * opacity);
    let final_a = max(base.a, blend.a * opacity);
    return vec4<f32>(final_rgb, final_a);
}

// 2. Multiply
fn blend_multiply(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = base.rgb * blend.rgb;
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 3. Screen
fn blend_screen(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = 1.0 - (1.0 - base.rgb) * (1.0 - blend.rgb);
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 4. Overlay
fn blend_overlay_ch(b: f32, s: f32) -> f32 {
    if (b < 0.5) {
        return 2.0 * b * s;
    } else {
        return 1.0 - 2.0 * (1.0 - b) * (1.0 - s);
    }
}
fn blend_overlay(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = vec3<f32>(
        blend_overlay_ch(base.r, blend.r),
        blend_overlay_ch(base.g, blend.g),
        blend_overlay_ch(base.b, blend.b)
    );
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 5. Darken
fn blend_darken(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = min(base.rgb, blend.rgb);
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 6. Lighten
fn blend_lighten(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = max(base.rgb, blend.rgb);
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 7. Color Dodge
fn blend_color_dodge(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = base.rgb / max(vec3<f32>(0.001), 1.0 - blend.rgb);
    return vec4<f32>(mix(base.rgb, clamp(blended, vec3<f32>(0.0), vec3<f32>(1.0)), blend.a * opacity), base.a);
}

// 8. Color Burn
fn blend_color_burn(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = 1.0 - (1.0 - base.rgb) / max(vec3<f32>(0.001), blend.rgb);
    return vec4<f32>(mix(base.rgb, clamp(blended, vec3<f32>(0.0), vec3<f32>(1.0)), blend.a * opacity), base.a);
}

// 9. Hard Light
fn blend_hard_light(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    return blend_overlay(blend, base, opacity);
}

// 10. Soft Light
fn blend_soft_light_ch(b: f32, s: f32) -> f32 {
    if (s <= 0.5) {
        return b - (1.0 - 2.0 * s) * b * (1.0 - b);
    } else {
        let d = select(sqrt(b), ((16.0 * b - 12.0) * b + 4.0) * b, b <= 0.25);
        return b + (2.0 * s - 1.0) * (d - b);
    }
}
fn blend_soft_light(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = vec3<f32>(
        blend_soft_light_ch(base.r, blend.r),
        blend_soft_light_ch(base.g, blend.g),
        blend_soft_light_ch(base.b, blend.b)
    );
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 11. Difference
fn blend_difference(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = abs(base.rgb - blend.rgb);
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 12. Exclusion
fn blend_exclusion(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = base.rgb + blend.rgb - 2.0 * base.rgb * blend.rgb;
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 13. Linear Dodge (Add)
fn blend_linear_dodge(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = clamp(base.rgb + blend.rgb, vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 14. Linear Burn
fn blend_linear_burn(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = clamp(base.rgb + blend.rgb - 1.0, vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 15. Glow Add (Neon VFX)
fn blend_glow_add(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let lum = rgb_to_luminance(blend.rgb);
    let glow = blend.rgb * smoothstep(0.4, 1.0, lum) * 1.5;
    let blended = clamp(base.rgb + glow, vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 16. Reflect
fn blend_reflect(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = (base.rgb * base.rgb) / max(vec3<f32>(0.001), 1.0 - blend.rgb);
    return vec4<f32>(mix(base.rgb, clamp(blended, vec3<f32>(0.0), vec3<f32>(1.0)), blend.a * opacity), base.a);
}
