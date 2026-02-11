# Shader Techniques Reference

> 33 techniques from 3D Game Shaders For Beginners
> Source: github.com/lettier/3d-game-shaders-for-beginners

---

## Overview

This reference covers practical shader implementations for real-time game graphics. Each technique includes GLSL code patterns, use cases, and complexity ratings.

**Complementary to**: `global-illumination.md` (architecture), `path-tracing.md` (offline), `render-graph.md` (pipeline)

---

## 1. Lighting & Materials (6 techniques)

### Blinn-Phong Shading
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Basic specular highlights |
| Key Concept | Half-vector between light and view direction |

```glsl
vec3 halfVector = normalize(lightDir + viewDir);
float spec = pow(max(dot(normal, halfVector), 0.0), shininess);
vec3 specular = lightColor * spec * specularStrength;
```

### Fresnel Effect
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Rim lighting, glass, water |
| Key Concept | Angle-dependent reflectivity |

```glsl
float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), fresnelPower);
vec3 fresnelColor = mix(baseColor, rimColor, fresnel);
```

### Rim Lighting
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Character highlights, sci-fi glow |
| Key Concept | Edge-based illumination |

```glsl
float rim = 1.0 - max(dot(viewDir, normal), 0.0);
rim = smoothstep(0.6, 1.0, rim);
vec3 rimLight = rimColor * rim * rimIntensity;
```

### Cel Shading (Toon)
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Stylized games, anime look |
| Key Concept | Quantized lighting bands |

```glsl
float NdotL = dot(normal, lightDir);
float bands = 3.0;
float toon = floor(NdotL * bands) / bands;
vec3 celColor = baseColor * toon;
```

### Normal Mapping
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Surface detail without geometry |
| Key Concept | Tangent space transformation |

```glsl
vec3 tangentNormal = texture(normalMap, uv).rgb * 2.0 - 1.0;
mat3 TBN = mat3(tangent, bitangent, normal);
vec3 worldNormal = normalize(TBN * tangentNormal);
```

### Texturing Fundamentals
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Base color, UV mapping |
| Key Concept | Texture coordinates and sampling |

```glsl
vec2 uv = fragTexCoord;
vec4 albedo = texture(diffuseMap, uv);
vec3 color = albedo.rgb * lightIntensity;
```

---

## 2. Screen-Space Effects (5 techniques)

### Deferred Rendering
| Aspect | Details |
|--------|---------|
| Complexity | High |
| Use Case | Many lights, complex scenes |
| Key Concept | G-Buffer with position, normal, albedo |

```glsl
// G-Buffer pass
layout(location = 0) out vec4 gPosition;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gAlbedo;

gPosition = vec4(fragPos, 1.0);
gNormal = vec4(normalize(normal), 1.0);
gAlbedo = vec4(albedo, specular);
```

### SSAO (Screen-Space Ambient Occlusion)
| Aspect | Details |
|--------|---------|
| Complexity | High |
| Use Case | Contact shadows, depth cues |
| Key Concept | Hemisphere sampling in screen space |

```glsl
float occlusion = 0.0;
for (int i = 0; i < kernelSize; i++) {
    vec3 samplePos = TBN * kernel[i];
    samplePos = fragPos + samplePos * radius;

    vec4 offset = projection * vec4(samplePos, 1.0);
    offset.xy = offset.xy / offset.w * 0.5 + 0.5;

    float sampleDepth = texture(gPosition, offset.xy).z;
    float rangeCheck = smoothstep(0.0, 1.0, radius / abs(fragPos.z - sampleDepth));
    occlusion += (sampleDepth >= samplePos.z + bias ? 1.0 : 0.0) * rangeCheck;
}
occlusion = 1.0 - (occlusion / kernelSize);
```

### SSR (Screen-Space Reflections)
| Aspect | Details |
|--------|---------|
| Complexity | High |
| Use Case | Reflective surfaces, water |
| Key Concept | Ray marching in screen space |

```glsl
vec3 reflectDir = reflect(-viewDir, normal);
vec3 hitPos = fragPos;
for (int i = 0; i < maxSteps; i++) {
    hitPos += reflectDir * stepSize;
    vec4 projPos = projection * vec4(hitPos, 1.0);
    vec2 screenUV = projPos.xy / projPos.w * 0.5 + 0.5;
    float depth = texture(depthBuffer, screenUV).r;
    if (hitPos.z > depth) {
        return texture(colorBuffer, screenUV).rgb;
    }
}
```

### Screen Space Refraction
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Glass, water distortion |
| Key Concept | UV offset based on normal |

```glsl
vec2 screenUV = gl_FragCoord.xy / screenSize;
vec2 refractOffset = normal.xy * refractionStrength;
vec3 refractedColor = texture(sceneTexture, screenUV + refractOffset).rgb;
```

### Fog
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Atmosphere, depth perception |
| Types | Linear, Exponential, Exponential Squared |

```glsl
// Linear fog
float fogFactor = (fogEnd - distance) / (fogEnd - fogStart);
fogFactor = clamp(fogFactor, 0.0, 1.0);

// Exponential fog
float fogFactor = exp(-fogDensity * distance);

// Final blend
vec3 finalColor = mix(fogColor, sceneColor, fogFactor);
```

---

## 3. Post-Processing (12 techniques)

### Blur (Gaussian)
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Bloom, DOF, UI backgrounds |
| Key Concept | Separable two-pass blur |

```glsl
// Horizontal pass
vec3 result = vec3(0.0);
float weights[5] = float[](0.227, 0.194, 0.121, 0.054, 0.016);
for (int i = -4; i <= 4; i++) {
    vec2 offset = vec2(float(i) * texelSize.x, 0.0);
    result += texture(image, uv + offset).rgb * weights[abs(i)];
}
```

### Bloom
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Glowing lights, HDR |
| Key Concept | Bright pass + blur + additive blend |

```glsl
// Bright pass
vec3 color = texture(scene, uv).rgb;
float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
vec3 bright = (brightness > threshold) ? color : vec3(0.0);

// After blur, combine
vec3 final = sceneColor + bloomBlurred * intensity;
```

### Motion Blur
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Fast movement, racing games |
| Key Concept | Velocity buffer sampling |

```glsl
vec2 velocity = texture(velocityBuffer, uv).xy;
vec3 result = texture(scene, uv).rgb;
for (int i = 1; i < samples; i++) {
    vec2 offset = velocity * (float(i) / float(samples) - 0.5);
    result += texture(scene, uv + offset).rgb;
}
result /= float(samples);
```

### Depth of Field
| Aspect | Details |
|--------|---------|
| Complexity | High |
| Use Case | Cinematic focus, photography |
| Key Concept | CoC (Circle of Confusion) based blur |

```glsl
float depth = texture(depthBuffer, uv).r;
float coc = abs(depth - focusDistance) * aperture;
coc = clamp(coc, 0.0, maxBlur);
vec3 sharp = texture(scene, uv).rgb;
vec3 blurred = texture(blurredScene, uv).rgb;
vec3 final = mix(sharp, blurred, coc);
```

### Chromatic Aberration
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Camera lens effect, damage feedback |
| Key Concept | RGB channel offset |

```glsl
vec2 direction = normalize(uv - 0.5);
float r = texture(scene, uv + direction * aberrationStrength).r;
float g = texture(scene, uv).g;
float b = texture(scene, uv - direction * aberrationStrength).b;
vec3 final = vec3(r, g, b);
```

### Film Grain
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Cinematic, retro, horror |
| Key Concept | Noise overlay |

```glsl
float noise = fract(sin(dot(uv * time, vec2(12.9898, 78.233))) * 43758.5453);
vec3 grain = vec3(noise * 2.0 - 1.0) * grainIntensity;
vec3 final = sceneColor + grain;
```

### Posterization
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Stylized, comic book |
| Key Concept | Color quantization |

```glsl
float levels = 8.0;
vec3 posterized = floor(sceneColor * levels) / levels;
```

### Pixelization
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Retro, pixel art style |
| Key Concept | UV snapping |

```glsl
vec2 pixelSize = vec2(1.0 / pixelsX, 1.0 / pixelsY);
vec2 pixelatedUV = floor(uv / pixelSize) * pixelSize;
vec3 color = texture(scene, pixelatedUV).rgb;
```

### Outlining (Edge Detection)
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Toon shading, selection highlight |
| Key Concept | Sobel filter on depth/normals |

```glsl
float edgeX = 0.0, edgeY = 0.0;
for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
        float depth = texture(depthBuffer, uv + vec2(i, j) * texelSize).r;
        edgeX += depth * sobelX[i+1][j+1];
        edgeY += depth * sobelY[i+1][j+1];
    }
}
float edge = sqrt(edgeX * edgeX + edgeY * edgeY);
```

### Sharpen
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Image enhancement |
| Key Concept | Unsharp mask |

```glsl
vec3 center = texture(scene, uv).rgb;
vec3 blurred = texture(blurredScene, uv).rgb;
vec3 sharpened = center + (center - blurred) * sharpness;
```

### LUT (Color Lookup Table)
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Color grading, mood |
| Key Concept | 3D texture color remap |

```glsl
vec3 color = texture(scene, uv).rgb;
float blue = color.b * 15.0;
vec2 lutUV;
lutUV.y = floor(blue) / 16.0 + color.g / 16.0;
lutUV.x = color.r;
vec3 graded = texture(lut, lutUV).rgb;
```

### Gamma Correction
| Aspect | Details |
|--------|---------|
| Complexity | Low |
| Use Case | Color accuracy, HDR |
| Key Concept | Linear to sRGB conversion |

```glsl
// Linear to sRGB
vec3 gammaCorrected = pow(linearColor, vec3(1.0 / 2.2));

// sRGB to Linear
vec3 linearColor = pow(srgbColor, vec3(2.2));
```

---

## 4. Special Effects (4 techniques)

### Flow Mapping
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Water flow, lava, animated surfaces |
| Key Concept | UV distortion over time |

```glsl
vec2 flowDir = texture(flowMap, uv).rg * 2.0 - 1.0;
float phase0 = fract(time * flowSpeed);
float phase1 = fract(time * flowSpeed + 0.5);
vec2 uv0 = uv + flowDir * phase0;
vec2 uv1 = uv + flowDir * phase1;
float blend = abs(phase0 - 0.5) * 2.0;
vec3 color = mix(texture(scene, uv0).rgb, texture(scene, uv1).rgb, blend);
```

### Foam
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Water edges, waves |
| Key Concept | Depth-based foam generation |

```glsl
float waterDepth = texture(depthBuffer, uv).r - fragDepth;
float foam = 1.0 - smoothstep(0.0, foamDistance, waterDepth);
foam *= texture(foamNoise, uv * foamScale + time * foamSpeed).r;
vec3 waterColor = mix(deepColor, foamColor, foam);
```

### Render to Texture
| Aspect | Details |
|--------|---------|
| Complexity | Medium |
| Use Case | Mirrors, portals, cameras |
| Key Concept | Framebuffer objects |

```glsl
// CPU: Bind FBO, render scene
// Shader: Sample the rendered texture
vec3 mirrorColor = texture(mirrorTexture, mirrorUV).rgb;
```

### Reference Frames
| Aspect | Details |
|--------|---------|
| Complexity | High |
| Use Case | Coordinate transformations |
| Spaces | Model, World, View, Clip, Screen |

```glsl
// Model to World
vec4 worldPos = modelMatrix * vec4(position, 1.0);

// World to View
vec4 viewPos = viewMatrix * worldPos;

// View to Clip
vec4 clipPos = projectionMatrix * viewPos;

// Clip to NDC
vec3 ndc = clipPos.xyz / clipPos.w;

// NDC to Screen
vec2 screen = (ndc.xy * 0.5 + 0.5) * screenSize;
```

---

## 5. Fundamentals (2 techniques)

### GLSL Basics
| Concept | Description |
|---------|-------------|
| Types | `float`, `vec2`, `vec3`, `vec4`, `mat3`, `mat4` |
| Qualifiers | `uniform`, `in`, `out`, `varying` |
| Built-ins | `gl_Position`, `gl_FragCoord`, `gl_FragColor` |
| Functions | `mix`, `smoothstep`, `clamp`, `normalize`, `dot`, `cross` |

### Setup (Render Pipeline)
```
1. Vertex Shader: Transform vertices
2. Rasterization: Convert to fragments
3. Fragment Shader: Color pixels
4. Post-Processing: Screen-space effects
5. Output: Final framebuffer
```

---

## Quick Reference Table

| Technique | Complexity | Category | Primary Use |
|-----------|------------|----------|-------------|
| Blinn-Phong | Low | Lighting | Specular highlights |
| Fresnel | Low | Lighting | Edge reflectivity |
| Rim Lighting | Low | Lighting | Character glow |
| Cel Shading | Medium | Lighting | Stylized/toon |
| Normal Mapping | Medium | Lighting | Surface detail |
| Texturing | Low | Materials | Base colors |
| Deferred Rendering | High | Screen-Space | Many lights |
| SSAO | High | Screen-Space | Contact shadows |
| SSR | High | Screen-Space | Reflections |
| Screen Space Refraction | Medium | Screen-Space | Glass/water |
| Fog | Low | Screen-Space | Atmosphere |
| Blur | Medium | Post-Process | Many effects |
| Bloom | Medium | Post-Process | Glowing lights |
| Motion Blur | Medium | Post-Process | Speed effect |
| Depth of Field | High | Post-Process | Cinematic focus |
| Chromatic Aberration | Low | Post-Process | Lens effect |
| Film Grain | Low | Post-Process | Cinematic |
| Posterization | Low | Post-Process | Stylized |
| Pixelization | Low | Post-Process | Retro |
| Outlining | Medium | Post-Process | Toon/selection |
| Sharpen | Low | Post-Process | Enhancement |
| LUT | Low | Post-Process | Color grading |
| Gamma Correction | Low | Post-Process | Color accuracy |
| Flow Mapping | Medium | Special | Animated surfaces |
| Foam | Medium | Special | Water edges |
| Render to Texture | Medium | Special | Mirrors/portals |
| Reference Frames | High | Fundamentals | Transforms |

---

## Integration with ULTRA-CREATE

### Usage by Request Type

| User Request | Recommended Techniques |
|--------------|------------------------|
| "jeu stylise" | Cel Shading, Outlining, Posterization |
| "jeu realiste" | Deferred, SSAO, SSR, Bloom, DOF |
| "jeu retro" | Pixelization, Film Grain, LUT |
| "effet eau" | SSR, Flow Mapping, Foam, Refraction |
| "post-processing" | Bloom, Chromatic Aberration, LUT, Vignette |
| "jeu horror" | Film Grain, Fog, Chromatic Aberration |
| "jeu anime" | Cel Shading, Rim Lighting, Outlining |

### Related Knowledge Files

| File | Complements |
|------|-------------|
| `global-illumination.md` | VCT, DDGI for advanced GI |
| `path-tracing.md` | Offline rendering reference |
| `render-graph.md` | Pipeline architecture |
| `unity/urp-rendering.md` | Unity-specific implementations |

---

*ULTRA-CREATE Gaming Knowledge v24.1 - Shader Techniques Reference*
