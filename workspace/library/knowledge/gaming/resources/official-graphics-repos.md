# Official Graphics Repositories

> Official samples, SDKs, and documentation for graphics APIs

---

## DirectX (Microsoft)

| Repository | Description | URL |
|------------|-------------|-----|
| **DirectX-Graphics-Samples** | D3D12 samples | [GitHub](https://github.com/microsoft/DirectX-Graphics-Samples) |
| **DirectXTK12** | D3D12 helper library | [GitHub](https://github.com/microsoft/DirectXTK12) |
| **DirectXTex** | Texture processing | [GitHub](https://github.com/microsoft/DirectXTex) |
| **DirectXMesh** | Mesh processing | [GitHub](https://github.com/microsoft/DirectXMesh) |
| **DirectXMath** | SIMD math library | [GitHub](https://github.com/microsoft/DirectXMath) |
| **DirectXShaderCompiler** | HLSL compiler (DXC) | [GitHub](https://github.com/microsoft/DirectXShaderCompiler) |
| **PIX** | Graphics debugger | [devblogs.microsoft.com/pix](https://devblogs.microsoft.com/pix/) |

### DirectX 12 Ultimate Features
```cpp
// Ray Tracing (DXR)
#include <d3d12.h>
D3D12_RAYTRACING_ACCELERATION_STRUCTURE_BUILD_FLAGS buildFlags =
    D3D12_RAYTRACING_ACCELERATION_STRUCTURE_BUILD_FLAG_PREFER_FAST_TRACE;

// Mesh Shaders
D3D12_PIPELINE_STATE_STREAM_DESC psoDesc = {};
psoDesc.pPipelineStateSubobjectStream = &meshShaderStream;

// Variable Rate Shading
D3D12_SHADING_RATE_COMBINER combiners[] = {
    D3D12_SHADING_RATE_COMBINER_MAX,
    D3D12_SHADING_RATE_COMBINER_SUM
};
```

---

## Vulkan (Khronos)

| Repository | Description | URL |
|------------|-------------|-----|
| **Vulkan-Samples** | Official samples | [GitHub](https://github.com/KhronosGroup/Vulkan-Samples) |
| **Vulkan-Hpp** | C++ bindings | [GitHub](https://github.com/KhronosGroup/Vulkan-Hpp) |
| **Vulkan-ValidationLayers** | Debug layers | [GitHub](https://github.com/KhronosGroup/Vulkan-ValidationLayers) |
| **Vulkan-Loader** | API loader | [GitHub](https://github.com/KhronosGroup/Vulkan-Loader) |
| **SPIRV-Cross** | SPIR-V reflection/transpilation | [GitHub](https://github.com/KhronosGroup/SPIRV-Cross) |
| **glslang** | GLSL to SPIR-V compiler | [GitHub](https://github.com/KhronosGroup/glslang) |
| **Vulkan-Guide** | Best practices guide | [GitHub](https://github.com/KhronosGroup/Vulkan-Guide) |

### Vulkan Extensions
```cpp
// Ray Tracing
VK_KHR_acceleration_structure
VK_KHR_ray_tracing_pipeline
VK_KHR_ray_query

// Mesh Shading
VK_EXT_mesh_shader

// Synchronization 2
VK_KHR_synchronization2

// Dynamic Rendering
VK_KHR_dynamic_rendering
```

---

## OpenGL (Khronos)

| Repository | Description | URL |
|------------|-------------|-----|
| **OpenGL-Registry** | Specs and extensions | [GitHub](https://github.com/KhronosGroup/OpenGL-Registry) |
| **OpenGL-Refpages** | Man pages | [GitHub](https://github.com/KhronosGroup/OpenGL-Refpages) |
| **glad** | GL loader generator | [GitHub](https://github.com/Dav1dde/glad) |
| **glfw** | Window/context creation | [GitHub](https://github.com/glfw/glfw) |
| **learnopengl** | Tutorials | [learnopengl.com](https://learnopengl.com) |

### Modern OpenGL (4.6)
```cpp
// Direct State Access (DSA)
glCreateBuffers(1, &vbo);
glNamedBufferStorage(vbo, size, data, 0);

// Bindless Textures
GLuint64 handle = glGetTextureHandleARB(texture);
glMakeTextureHandleResidentARB(handle);

// Compute Shaders
glDispatchCompute(groupsX, groupsY, groupsZ);
```

---

## WebGPU

| Repository | Description | URL |
|------------|-------------|-----|
| **gpuweb** | W3C spec | [GitHub](https://github.com/gpuweb/gpuweb) |
| **webgpu-samples** | Official samples | [GitHub](https://github.com/webgpu/webgpu-samples) |
| **wgpu** | Rust implementation | [GitHub](https://github.com/gfx-rs/wgpu) |
| **Dawn** | Google's implementation | [GitHub](https://dawn.googlesource.com/dawn) |

### WebGPU (WGSL)
```wgsl
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 3>(
        vec2<f32>( 0.0,  0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>( 0.5, -0.5)
    );
    return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
```

---

## Metal (Apple)

| Repository | Description | URL |
|------------|-------------|-----|
| **metal-cpp** | C++ wrapper | [GitHub](https://github.com/bkaradzic/metal-cpp) |
| **Metal Sample Code** | Apple samples | [developer.apple.com](https://developer.apple.com/metal/) |
| **MetalKit** | Helper framework | Built into Xcode |

### Metal Features
```metal
// Ray Tracing
kernel void rayGeneration(
    acceleration_structure<> accelStruct [[buffer(0)]],
    device Ray* rays [[buffer(1)]],
    uint tid [[thread_position_in_grid]]
) {
    intersector<> i;
    i.accept_any_intersection(false);
    auto result = i.intersect(rays[tid], accelStruct);
}

// Mesh Shaders (Metal 3)
[[mesh]]
void meshMain(
    object_data ObjectData& objectData [[payload]],
    mesh<triangle, Vertex, Primitive, 256, 512> outputMesh
) {
    // Generate geometry
}
```

---

## NVIDIA

| Repository | Description | URL |
|------------|-------------|-----|
| **nvpro-samples** | Advanced samples | [GitHub](https://github.com/nvpro-samples) |
| **DLSS** | Deep Learning Super Sampling | [GitHub](https://github.com/NVIDIA/DLSS) |
| **NRD** | Real-time Denoisers | [GitHub](https://github.com/NVIDIAGameWorks/NRD) |
| **Falcor** | Real-time rendering framework | [GitHub](https://github.com/NVIDIAGameWorks/Falcor) |
| **PhysX** | Physics engine | [GitHub](https://github.com/NVIDIA-Omniverse/PhysX) |
| **OptiX** | Ray tracing SDK | [developer.nvidia.com/optix](https://developer.nvidia.com/optix) |

---

## AMD

| Repository | Description | URL |
|------------|-------------|-----|
| **GPUOpen** | AMD open source | [gpuopen.com](https://gpuopen.com) |
| **FidelityFX** | Effects library | [GitHub](https://github.com/GPUOpen-Effects/FidelityFX-SDK) |
| **RadeonRays** | Ray tracing library | [GitHub](https://github.com/GPUOpen-LibrariesAndSDKs/RadeonRays_SDK) |
| **RenderPipeline** | Hybrid rendering | [GitHub](https://github.com/GPUOpen-LibrariesAndSDKs/HybridRendering) |

### FidelityFX Effects
- **FSR 3** - Super Resolution + Frame Generation
- **CACAO** - Ambient Occlusion
- **SSSR** - Stochastic Screen-Space Reflections
- **Denoiser** - Ray tracing denoiser

---

## Intel

| Repository | Description | URL |
|------------|-------------|-----|
| **embree** | Ray tracing kernels | [GitHub](https://github.com/embree/embree) |
| **oneAPI** | Unified programming | [intel.com/oneapi](https://www.intel.com/content/www/us/en/developer/tools/oneapi/overview.html) |
| **OpenImageDenoise** | ML denoiser | [GitHub](https://github.com/OpenImageDenoise/oidn) |
| **OSPRay** | Scalable ray tracing | [GitHub](https://github.com/ospray/ospray) |

---

## Cross-Platform Libraries

| Library | Purpose | URL |
|---------|---------|-----|
| **bgfx** | Rendering abstraction | [GitHub](https://github.com/bkaradzic/bgfx) |
| **sokol** | Minimal cross-platform | [GitHub](https://github.com/floooh/sokol) |
| **The-Forge** | Cross-platform renderer | [GitHub](https://github.com/ConfettiFX/The-Forge) |
| **Diligent Engine** | Modern graphics abstraction | [GitHub](https://github.com/DiligentGraphics/DiligentEngine) |

---

## Shader Languages

| Language | Target | Compiler |
|----------|--------|----------|
| **HLSL** | DirectX, Vulkan (SPIR-V) | DXC, FXC |
| **GLSL** | OpenGL, Vulkan (SPIR-V) | glslang |
| **WGSL** | WebGPU | Tint (Dawn) |
| **MSL** | Metal | Metal Compiler |
| **SPIR-V** | Vulkan, OpenCL | SPIRV-Tools |

### Shader Cross-Compilation
```
HLSL ──► DXC ──► SPIR-V ──► SPIRV-Cross ──► GLSL/MSL/WGSL
                    │
                    └───► Vulkan
```

---

## Debugging Tools

| Tool | Platforms | URL |
|------|-----------|-----|
| **RenderDoc** | All | [renderdoc.org](https://renderdoc.org) |
| **PIX** | DirectX | [devblogs.microsoft.com/pix](https://devblogs.microsoft.com/pix/) |
| **Nsight Graphics** | NVIDIA | [developer.nvidia.com](https://developer.nvidia.com/nsight-graphics) |
| **Radeon GPU Profiler** | AMD | [gpuopen.com](https://gpuopen.com/rgp/) |
| **Xcode GPU Tools** | Metal | Xcode |
| **Intel GPA** | Intel | [intel.com/gpa](https://www.intel.com/content/www/us/en/developer/tools/graphics-performance-analyzers/overview.html) |

---

*ULTRA-CREATE Gaming Knowledge v24.1*
