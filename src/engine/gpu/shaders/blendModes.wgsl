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

// 17. Dissolve (randomized dither)
fn blend_dissolve(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let threshold = fract(sin(dot(base.rg, vec2<f32>(12.9898, 78.233))) * 43758.5453);
    if (threshold < blend.a * opacity) {
        return vec4<f32>(blend.rgb, base.a);
    }
    return base;
}

// 18. Darker Color
fn blend_darker_color(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let lumBase = rgb_to_luminance(base.rgb);
    let lumBlend = rgb_to_luminance(blend.rgb);
    let result = select(base.rgb, blend.rgb, lumBlend < lumBase);
    return vec4<f32>(mix(base.rgb, result, blend.a * opacity), base.a);
}

// 19. Lighter Color
fn blend_lighter_color(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let lumBase = rgb_to_luminance(base.rgb);
    let lumBlend = rgb_to_luminance(blend.rgb);
    let result = select(base.rgb, blend.rgb, lumBlend > lumBase);
    return vec4<f32>(mix(base.rgb, result, blend.a * opacity), base.a);
}

// 20. Vivid Light
fn blend_vivid_light_ch(b: f32, s: f32) -> f32 {
    if (s <= 0.5) {
        return 1.0 - (1.0 - b) / max(0.001, 2.0 * s);
    } else {
        return b / max(0.001, 2.0 * (1.0 - s));
    }
}
fn blend_vivid_light(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = vec3<f32>(
        blend_vivid_light_ch(base.r, blend.r),
        blend_vivid_light_ch(base.g, blend.g),
        blend_vivid_light_ch(base.b, blend.b)
    );
    return vec4<f32>(mix(base.rgb, clamp(blended, vec3<f32>(0.0), vec3<f32>(1.0)), blend.a * opacity), base.a);
}

// 21. Linear Light
fn blend_linear_light(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = clamp(base.rgb + 2.0 * blend.rgb - 1.0, vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 22. Pin Light
fn blend_pin_light_ch(b: f32, s: f32) -> f32 {
    if (s < 0.5) {
        return min(b, 2.0 * s);
    } else {
        return max(b, 2.0 * s - 1.0);
    }
}
fn blend_pin_light(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = vec3<f32>(
        blend_pin_light_ch(base.r, blend.r),
        blend_pin_light_ch(base.g, blend.g),
        blend_pin_light_ch(base.b, blend.b)
    );
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 23. Hard Mix
fn blend_hard_mix(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let vl = vec3<f32>(
        blend_vivid_light_ch(base.r, blend.r),
        blend_vivid_light_ch(base.g, blend.g),
        blend_vivid_light_ch(base.b, blend.b)
    );
    let blended = vec3<f32>(
        select(0.0, 1.0, vl.r >= 0.5),
        select(0.0, 1.0, vl.g >= 0.5),
        select(0.0, 1.0, vl.b >= 0.5)
    );
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 24. Subtract
fn blend_subtract(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = clamp(base.rgb - blend.rgb, vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 25. Divide
fn blend_divide(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = clamp(base.rgb / max(vec3<f32>(0.001), blend.rgb), vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// Helper: RGB to HSL
fn rgb_to_hsl(c: vec3<f32>) -> vec3<f32> {
    let maxC = max(max(c.r, c.g), c.b);
    let minC = min(min(c.r, c.g), c.b);
    let l = (maxC + minC) * 0.5;
    if (maxC == minC) {
        return vec3<f32>(0.0, 0.0, l);
    }
    let d = maxC - minC;
    let s = select(d / (2.0 - maxC - minC), d / (maxC + minC), l > 0.5);
    var h: f32 = 0.0;
    if (maxC == c.r) {
        h = (c.g - c.b) / d + select(0.0, 6.0, c.g < c.b);
    } else if (maxC == c.g) {
        h = (c.b - c.r) / d + 2.0;
    } else {
        h = (c.r - c.g) / d + 4.0;
    }
    h /= 6.0;
    return vec3<f32>(h, s, l);
}

fn hue_to_rgb(p: f32, q: f32, t_in: f32) -> f32 {
    var t = t_in;
    if (t < 0.0) { t += 1.0; }
    if (t > 1.0) { t -= 1.0; }
    if (t < 1.0 / 6.0) { return p + (q - p) * 6.0 * t; }
    if (t < 0.5) { return q; }
    if (t < 2.0 / 3.0) { return p + (q - p) * (2.0 / 3.0 - t) * 6.0; }
    return p;
}

fn hsl_to_rgb(hsl: vec3<f32>) -> vec3<f32> {
    if (hsl.y == 0.0) {
        return vec3<f32>(hsl.z, hsl.z, hsl.z);
    }
    let q = select(hsl.z + hsl.y - hsl.z * hsl.y, hsl.z * (1.0 + hsl.y), hsl.z < 0.5);
    let p = 2.0 * hsl.z - q;
    return vec3<f32>(
        hue_to_rgb(p, q, hsl.x + 1.0 / 3.0),
        hue_to_rgb(p, q, hsl.x),
        hue_to_rgb(p, q, hsl.x - 1.0 / 3.0)
    );
}

// 26. Hue
fn blend_hue(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let baseHSL = rgb_to_hsl(base.rgb);
    let blendHSL = rgb_to_hsl(blend.rgb);
    let result = hsl_to_rgb(vec3<f32>(blendHSL.x, baseHSL.y, baseHSL.z));
    return vec4<f32>(mix(base.rgb, result, blend.a * opacity), base.a);
}

// 27. Saturation
fn blend_saturation(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let baseHSL = rgb_to_hsl(base.rgb);
    let blendHSL = rgb_to_hsl(blend.rgb);
    let result = hsl_to_rgb(vec3<f32>(baseHSL.x, blendHSL.y, baseHSL.z));
    return vec4<f32>(mix(base.rgb, result, blend.a * opacity), base.a);
}

// 28. Color
fn blend_color(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let baseHSL = rgb_to_hsl(base.rgb);
    let blendHSL = rgb_to_hsl(blend.rgb);
    let result = hsl_to_rgb(vec3<f32>(blendHSL.x, blendHSL.y, baseHSL.z));
    return vec4<f32>(mix(base.rgb, result, blend.a * opacity), base.a);
}

// 29. Luminosity
fn blend_luminosity(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let baseHSL = rgb_to_hsl(base.rgb);
    let blendHSL = rgb_to_hsl(blend.rgb);
    let result = hsl_to_rgb(vec3<f32>(baseHSL.x, baseHSL.y, blendHSL.z));
    return vec4<f32>(mix(base.rgb, result, blend.a * opacity), base.a);
}

// 30. Freeze
fn blend_freeze(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = clamp(1.0 - (1.0 - base.rgb) * (1.0 - base.rgb) / max(vec3<f32>(0.001), blend.rgb), vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 31. Heat
fn blend_heat(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = clamp(1.0 - (1.0 - blend.rgb) * (1.0 - blend.rgb) / max(vec3<f32>(0.001), base.rgb), vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 32. Grain Extract
fn blend_grain_extract(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = clamp(base.rgb - blend.rgb + 0.5, vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 33. Grain Merge
fn blend_grain_merge(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = clamp(base.rgb + blend.rgb - 0.5, vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}

// 34. Chroma Stencil (green/blue screen key)
fn blend_chroma_stencil(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let greenDiff = blend.g - max(blend.r, blend.b);
    let blueDiff = blend.b - max(blend.r, blend.g);
    let isChroma = max(greenDiff, blueDiff);
    let alpha = 1.0 - smoothstep(0.1, 0.4, isChroma);
    return vec4<f32>(mix(base.rgb, blend.rgb, alpha * blend.a * opacity), max(base.a, alpha * blend.a * opacity));
}

// 35. Silhouette Alpha
fn blend_silhouette_alpha(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    return vec4<f32>(base.rgb, base.a * blend.a * opacity);
}

// 36. Inverted Alpha Mask
fn blend_alpha_mask_inverted(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    return vec4<f32>(base.rgb, base.a * (1.0 - blend.a * opacity));
}

// 37. Hard Color (posterized pop-art)
fn blend_hard_color(base: vec4<f32>, blend: vec4<f32>, opacity: f32) -> vec4<f32> {
    let blended = vec3<f32>(
        select(0.0, 1.0, base.r + blend.r >= 1.0),
        select(0.0, 1.0, base.g + blend.g >= 1.0),
        select(0.0, 1.0, base.b + blend.b >= 1.0)
    );
    return vec4<f32>(mix(base.rgb, blended, blend.a * opacity), base.a);
}
