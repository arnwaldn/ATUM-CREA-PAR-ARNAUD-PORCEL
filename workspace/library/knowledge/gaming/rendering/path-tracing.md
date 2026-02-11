# Path Tracing - Reference Guide

> Techniques for offline and real-time path tracing

---

## Offline Path Tracers

### Production Quality

| Engine | Description | URL |
|--------|-------------|-----|
| **pbrt-v4** | Physically based renderer (reference book) | [GitHub](https://github.com/mmp/pbrt-v4) |
| **Mitsuba 3** | Research-oriented differentiable renderer | [GitHub](https://github.com/mitsuba-renderer/mitsuba3) |
| **appleseed** | Physically-based global illumination | [GitHub](https://github.com/appleseedhq/appleseed) |
| **LuxCoreRender** | Unbiased GPU rendering | [GitHub](https://github.com/LuxCoreRender/LuxCore) |
| **Cycles** | Blender's production renderer | [Blender](https://www.cycles-renderer.org/) |

### Educational

| Engine | Description | URL |
|--------|-------------|-----|
| **Ray Tracing in One Weekend** | Tutorial series | [GitHub](https://github.com/RayTracing/raytracing.github.io) |
| **smallpt** | 99 lines path tracer | [kevinbeason.com](http://www.kevinbeason.com/smallpt/) |
| **SORT** | Simple Open-source Ray Tracer | [GitHub](https://github.com/JiayinCao/SORT) |

---

## Real-Time Path Tracing

### Production Engines

| Engine | Description | URL |
|--------|-------------|-----|
| **kajiya** | Experimental real-time GI (Embark Studios) | [GitHub](https://github.com/EmbarkStudios/kajiya) |
| **NVIDIA RTX** | Hardware-accelerated ray tracing | [NVIDIA](https://developer.nvidia.com/rtx) |
| **AMD FSR RT** | AMD ray tracing framework | [GPUOpen](https://gpuopen.com/) |

### Techniques

| Technique | Description | Paper/Impl |
|-----------|-------------|------------|
| **ReSTIR** | Reservoir-based Spatiotemporal Importance Resampling | [NVIDIA](https://research.nvidia.com/publication/2020-07_spatiotemporal-reservoir-resampling-real-time-ray-tracing-dynamic-direct) |
| **RTXGI** | Real-time GI with dynamic probes | [NVIDIA RTXGI](https://developer.nvidia.com/rtxgi) |
| **RTXDI** | Real-time direct illumination | [NVIDIA](https://developer.nvidia.com/rtxdi) |

---

## Ray Tracing Libraries

### CPU

| Library | Description | URL |
|---------|-------------|-----|
| **embree** | High-performance kernels (Intel) | [GitHub](https://github.com/embree/embree) |
| **nanort** | Single-header BVH library | [GitHub](https://github.com/lighttransport/nanort) |

### GPU

| Library | Description | URL |
|---------|-------------|-----|
| **OptiX** | NVIDIA GPU ray tracing | [NVIDIA](https://developer.nvidia.com/optix) |
| **RadeonRays** | AMD GPU ray tracing | [GPUOpen](https://github.com/GPUOpen-LibrariesAndSDKs/RadeonRays_SDK) |
| **Vulkan Ray Tracing** | Cross-platform RT extension | [Khronos](https://www.khronos.org/blog/ray-tracing-in-vulkan) |
| **DirectX 12 DXR** | DirectX ray tracing | [Microsoft](https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html) |

---

## BVH (Bounding Volume Hierarchy)

### Construction

```cpp
// Basic AABB
struct AABB {
    vec3 min, max;

    bool intersect(const Ray& ray, float& tMin, float& tMax) {
        vec3 invDir = 1.0f / ray.direction;
        vec3 t0 = (min - ray.origin) * invDir;
        vec3 t1 = (max - ray.origin) * invDir;

        tMin = max(max(min(t0.x, t1.x), min(t0.y, t1.y)), min(t0.z, t1.z));
        tMax = min(min(max(t0.x, t1.x), max(t0.y, t1.y)), max(t0.z, t1.z));

        return tMax >= tMin && tMax > 0;
    }
};
```

### Traversal Strategies

| Strategy | Best For | Complexity |
|----------|----------|------------|
| **SAH (Surface Area Heuristic)** | Static scenes | O(n log n) |
| **LBVH (Linear BVH)** | Dynamic scenes | O(n) |
| **HLBVH (Hierarchical LBVH)** | GPU construction | O(n) |
| **TLAS/BLAS** | Instance-heavy scenes | Two-level |

---

## Monte Carlo Integration

### Importance Sampling

```glsl
// Cosine-weighted hemisphere sampling
vec3 cosineSampleHemisphere(vec2 u) {
    float phi = 2.0 * PI * u.x;
    float cosTheta = sqrt(u.y);
    float sinTheta = sqrt(1.0 - u.y);

    return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);
}

// GGX importance sampling (microfacet)
vec3 importanceSampleGGX(vec2 u, float roughness) {
    float a = roughness * roughness;
    float phi = 2.0 * PI * u.x;
    float cosTheta = sqrt((1.0 - u.y) / (1.0 + (a*a - 1.0) * u.y));
    float sinTheta = sqrt(1.0 - cosTheta * cosTheta);

    return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);
}
```

### Denoising

| Technique | Description |
|-----------|-------------|
| **SVGF** | Spatiotemporal Variance-Guided Filtering |
| **A-SVGF** | Adaptive SVGF |
| **OIDN** | Intel Open Image Denoise (ML-based) |
| **NRD** | NVIDIA Real-time Denoisers |

---

## WebGPU Path Tracing

```typescript
// Basic ray generation shader (WGSL)
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let pixel = vec2<f32>(id.xy);
    let uv = (pixel + 0.5) / resolution;

    var ray = generateCameraRay(uv);
    var color = vec3<f32>(0.0);
    var throughput = vec3<f32>(1.0);

    for (var bounce = 0u; bounce < MAX_BOUNCES; bounce++) {
        let hit = traceRay(ray);
        if (!hit.valid) {
            color += throughput * sampleEnvironment(ray.direction);
            break;
        }

        let material = getMaterial(hit);
        color += throughput * material.emission;

        // Sample BRDF
        let sample = sampleBRDF(material, hit.normal, -ray.direction);
        throughput *= sample.weight;

        ray.origin = hit.position + hit.normal * EPSILON;
        ray.direction = sample.direction;
    }

    storePixel(id.xy, color);
}
```

---

## Performance Tips

### CPU
1. Use SIMD (SSE/AVX) for ray-AABB tests
2. Stream compaction for coherent rays
3. Packet tracing (4-8 rays at once)

### GPU
1. Use hardware RT cores when available
2. Minimize divergence in shaders
3. Use persistent threads pattern
4. Temporal accumulation for noise reduction

---

## Resources

- [Ray Tracing Gems](https://www.realtimerendering.com/raytracinggems/) - NVIDIA book series
- [Physically Based Rendering](https://pbrt.org/) - pbrt book (free online)
- [NVIDIA Developer Blog](https://developer.nvidia.com/blog/tag/ray-tracing/)

---

*ULTRA-CREATE Gaming Knowledge v24.1*
