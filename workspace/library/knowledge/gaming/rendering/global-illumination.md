# Global Illumination Techniques

> Real-time and hybrid GI methods for games

---

## Overview

| Technique | Quality | Performance | Dynamic | Best For |
|-----------|---------|-------------|---------|----------|
| **Baked Lightmaps** | High | Excellent | No | Static scenes |
| **Light Probes** | Medium | Excellent | Partial | Characters |
| **Screen-Space GI** | Low-Med | Good | Yes | Quick boost |
| **VCT** | High | Medium | Yes | Indoor scenes |
| **DDGI** | High | Medium | Yes | Large worlds |
| **LPV** | Medium | Good | Yes | Legacy/mobile |
| **Radiance Cache** | High | Medium | Yes | Path-traced |
| **Surfel GI** | High | Medium | Yes | Modern engines |

---

## Voxel Cone Tracing (VCT)

### Concept
Voxelize scene, store lighting in 3D texture, trace cones for GI.

### Implementation

```glsl
// Voxel cone tracing
vec3 coneTrace(vec3 origin, vec3 direction, float coneAngle, float maxDist) {
    vec3 color = vec3(0.0);
    float alpha = 0.0;

    float t = voxelSize;  // Start at one voxel distance
    float tanHalfAngle = tan(coneAngle * 0.5);

    while (t < maxDist && alpha < 0.95) {
        float diameter = 2.0 * tanHalfAngle * t;
        float mipLevel = log2(diameter / voxelSize);

        vec3 samplePos = origin + direction * t;
        vec4 voxel = textureLod(voxelTexture, samplePos, mipLevel);

        // Front-to-back blending
        color += (1.0 - alpha) * voxel.rgb * voxel.a;
        alpha += (1.0 - alpha) * voxel.a;

        t += diameter * 0.5;  // Step by half diameter
    }

    return color;
}

// Diffuse GI: 5-6 cones over hemisphere
vec3 indirectDiffuse(vec3 position, vec3 normal) {
    vec3 result = vec3(0.0);

    // Central cone
    result += coneTrace(position, normal, 60.0 * DEG2RAD, maxDistance) * 0.25;

    // Side cones (4-5 around normal)
    for (int i = 0; i < 4; i++) {
        float angle = float(i) * PI * 0.5;
        vec3 dir = normalize(mix(normal, tangent * cos(angle) + bitangent * sin(angle), 0.5));
        result += coneTrace(position, dir, 60.0 * DEG2RAD, maxDistance) * 0.1875;
    }

    return result;
}
```

### Pros/Cons
- Good for specular reflections
- Expensive voxelization
- Light leaking through thin walls

---

## DDGI (Dynamic Diffuse Global Illumination)

### Concept
Grid of irradiance probes with ray-traced updates.

### Implementation

```glsl
// Probe grid sampling
struct DDGIVolume {
    vec3 origin;
    vec3 probeSpacing;
    ivec3 probeCount;
    sampler2D irradianceAtlas;
    sampler2D depthAtlas;
};

vec3 sampleDDGI(DDGIVolume volume, vec3 worldPos, vec3 normal) {
    // Find 8 surrounding probes
    vec3 localPos = (worldPos - volume.origin) / volume.probeSpacing;
    ivec3 baseProbe = ivec3(floor(localPos));
    vec3 alpha = fract(localPos);

    vec3 irradiance = vec3(0.0);
    float totalWeight = 0.0;

    // Trilinear interpolation with visibility weighting
    for (int i = 0; i < 8; i++) {
        ivec3 offset = ivec3(i & 1, (i >> 1) & 1, (i >> 2) & 1);
        ivec3 probeCoord = baseProbe + offset;

        vec3 probePos = volume.origin + vec3(probeCoord) * volume.probeSpacing;
        vec3 probeToPoint = worldPos - probePos;

        // Visibility test using depth
        float visibility = testProbeVisibility(volume, probeCoord, probeToPoint);

        // Trilinear weight
        vec3 trilinear = mix(1.0 - alpha, alpha, vec3(offset));
        float weight = trilinear.x * trilinear.y * trilinear.z;

        // Cosine weight (probe facing surface)
        weight *= max(0.0, dot(normalize(probeToPoint), normal));

        // Sample irradiance
        vec3 probeIrradiance = sampleProbeIrradiance(volume, probeCoord, normal);

        irradiance += probeIrradiance * weight * visibility;
        totalWeight += weight * visibility;
    }

    return irradiance / max(totalWeight, 0.0001);
}
```

### Probe Update (Ray Tracing)

```glsl
// Per-frame probe update
void updateProbe(ivec2 probeIndex) {
    vec3 probePos = getProbePosition(probeIndex);

    // Cast rays in sphere (octahedral mapping)
    for (int ray = 0; ray < RAYS_PER_PROBE; ray++) {
        vec3 direction = sphericalFibonacci(ray, RAYS_PER_PROBE);

        RayHit hit = traceRay(probePos, direction);

        // Store radiance and depth
        vec3 radiance = hit.valid ? hit.emission + hit.albedo * directLight(hit) : skyColor(direction);
        float depth = hit.valid ? hit.distance : FAR_PLANE;

        updateProbeTexel(probeIndex, ray, radiance, depth);
    }
}
```

### Resources
- [NVIDIA RTXGI](https://developer.nvidia.com/rtxgi)
- [Scaling Probe-Based GI](https://jcgt.org/published/0008/02/01/)

---

## Light Propagation Volumes (LPV)

### Concept
Inject light into 3D grid, propagate through cells.

```glsl
// Light injection
void injectLight(vec3 position, vec3 flux, vec3 direction) {
    ivec3 cell = worldToGrid(position);

    // Store as spherical harmonics
    vec4 sh = dirToSH(direction);
    atomicAdd(lpvR[cell], sh * flux.r);
    atomicAdd(lpvG[cell], sh * flux.g);
    atomicAdd(lpvB[cell], sh * flux.b);
}

// Propagation step (run multiple iterations)
void propagate() {
    for each cell {
        vec4 flux[6]; // 6 neighbors
        for (int face = 0; face < 6; face++) {
            ivec3 neighbor = cell + faceDirections[face];
            flux[face] = sampleSH(lpv[neighbor], -faceDirections[face]);
        }

        // Accumulate propagated light
        vec4 newSH = sumFlux(flux);
        lpv[cell] = mix(lpv[cell], newSH, propagationFactor);
    }
}
```

### Pros/Cons
- Fast propagation
- Coarse resolution (light leaking)
- Good for large-scale ambient

---

## Radiance Cache

### Concept
Cache radiance samples, reuse temporally.

```glsl
// World-space radiance caching
struct RadianceSample {
    vec3 position;
    vec3 normal;
    vec3 radiance;
    float validity;
};

vec3 queryRadianceCache(vec3 pos, vec3 normal) {
    // Hash position to cache cell
    uint cacheIndex = hashPosition(pos);

    // Check cache validity
    RadianceSample cached = radianceCache[cacheIndex];

    if (isValid(cached, pos, normal)) {
        return cached.radiance;
    }

    // Cache miss - trace new sample
    vec3 newRadiance = traceIndirect(pos, normal);
    storeCache(cacheIndex, pos, normal, newRadiance);

    return newRadiance;
}
```

### Used In
- Lumen (Unreal Engine 5)
- ReSTIR GI

---

## Surfel GI

### Concept
Surface elements (surfels) store and propagate lighting.

```glsl
// Surfel structure
struct Surfel {
    vec3 position;
    vec3 normal;
    vec3 albedo;
    vec3 irradiance;
    float radius;
};

// Surfel placement (during GBuffer pass)
void placeSurfel(vec3 worldPos, vec3 normal, vec3 albedo) {
    uint surfelIndex = atomicAdd(surfelCount, 1);
    surfels[surfelIndex] = Surfel(worldPos, normal, albedo, vec3(0), calculateRadius(worldPos));
}

// Surfel lighting (ray traced or rasterized)
void updateSurfelLighting() {
    for each surfel {
        // Direct light
        surfel.irradiance = directLighting(surfel.position, surfel.normal);

        // Gather from nearby surfels (indirect)
        surfel.irradiance += gatherNearbyRadiance(surfel);
    }
}

// Final gathering
vec3 sampleSurfelGI(vec3 pos, vec3 normal) {
    vec3 result = vec3(0.0);
    float totalWeight = 0.0;

    // Find nearby surfels (spatial hash)
    for each nearSurfel in findNearbySurfels(pos) {
        float weight = surfelWeight(pos, normal, nearSurfel);
        result += nearSurfel.irradiance * nearSurfel.albedo * weight;
        totalWeight += weight;
    }

    return result / max(totalWeight, 0.0001);
}
```

### Engines Using Surfels
- Frostbite
- Unity HDRP (experimental)
- Custom engines

---

## Screen-Space GI (SSGI)

### Quick Implementation

```glsl
// Simple SSGI (ray marching in screen space)
vec3 ssgi(vec2 uv, vec3 worldPos, vec3 normal) {
    vec3 result = vec3(0.0);

    for (int i = 0; i < SAMPLE_COUNT; i++) {
        // Random direction in hemisphere
        vec3 sampleDir = hemisphereDirection(normal, randomVec2(uv, i));

        // March in screen space
        vec3 samplePos = worldPos;
        for (int step = 0; step < MAX_STEPS; step++) {
            samplePos += sampleDir * stepSize;

            vec2 sampleUV = worldToScreen(samplePos);
            float sampleDepth = texture(depthBuffer, sampleUV).r;
            float actualDepth = linearDepth(samplePos);

            if (actualDepth > sampleDepth) {
                // Hit! Sample color
                result += texture(colorBuffer, sampleUV).rgb;
                break;
            }
        }
    }

    return result / float(SAMPLE_COUNT);
}
```

---

## Comparison Table

| Technique | Memory | GPU Cost | Ray Tracing | Dynamic Lights |
|-----------|--------|----------|-------------|----------------|
| VCT | High (3D tex) | Medium | No | Yes |
| DDGI | Medium | Medium | Yes | Yes |
| LPV | Low | Low | No | Yes |
| Radiance Cache | Variable | Medium | Yes | Yes |
| Surfel GI | Medium | Medium | Optional | Yes |
| SSGI | Low | Low-Med | No | Yes |

---

*ULTRA-CREATE Gaming Knowledge v24.1*
