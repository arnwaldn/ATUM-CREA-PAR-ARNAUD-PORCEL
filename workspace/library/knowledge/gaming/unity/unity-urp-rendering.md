# Unity Universal Render Pipeline (URP)

## Setup

### New Project
Select "3D (URP)" template when creating project.

### Convert Existing Project

```
1. Package Manager > Universal RP
2. Create > Rendering > URP Asset (with Universal Renderer)
3. Edit > Project Settings > Graphics > Scriptable Render Pipeline Settings
4. Edit > Rendering > Materials > Convert All Built-in Materials to URP
```

## URP Asset Configuration

### Quality Settings

```
URP Asset:
├── Rendering
│   ├── Depth Texture: On (for effects)
│   ├── Opaque Texture: On (refraction)
│   └── Opaque Downsampling: 2x Bilinear
├── Quality
│   ├── HDR: On
│   ├── Anti Aliasing: MSAA 4x
│   └── Render Scale: 1.0
├── Lighting
│   ├── Main Light: Per Pixel
│   ├── Additional Lights: Per Pixel (limit: 4)
│   └── Reflection Probes: On
├── Shadows
│   ├── Max Distance: 50
│   └── Cascade Count: 4
└── Post-processing
    └── Enabled: On
```

### Multiple Quality Levels

```
Assets/Settings/
├── URP-Low.asset
├── URP-Medium.asset
├── URP-High.asset
└── URP-Ultra.asset
```

```csharp
public class QualityManager : MonoBehaviour
{
    [SerializeField] private UniversalRenderPipelineAsset[] qualityLevels;

    public void SetQuality(int level)
    {
        QualitySettings.SetQualityLevel(level);
        // Or directly:
        // GraphicsSettings.renderPipelineAsset = qualityLevels[level];
    }
}
```

## Lighting

### Light Types

```csharp
// Directional (sun)
Light mainLight;
mainLight.type = LightType.Directional;
mainLight.shadows = LightShadows.Soft;

// Point Light
Light pointLight;
pointLight.type = LightType.Point;
pointLight.range = 10f;
pointLight.intensity = 1f;

// Spot Light
Light spotLight;
spotLight.type = LightType.Spot;
spotLight.spotAngle = 30f;
```

### Light Layers

```csharp
// Assign rendering layer
light.renderingLayerMask = 1 << 0;  // Layer 0

// Filter in renderer
meshRenderer.renderingLayerMask = 1 << 0;
```

### Baked Lighting

```
1. Mark static objects as "Contribute GI: Static"
2. Window > Rendering > Lighting
3. Generate Lighting
```

## Post-Processing

### Volume Setup

```
1. Create > Volume > Global Volume
2. Add Volume component
3. Create Profile
4. Add overrides
```

### Common Effects

```csharp
// Via code
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

public class PostProcessController : MonoBehaviour
{
    [SerializeField] private Volume volume;

    private Bloom _bloom;
    private Vignette _vignette;
    private ColorAdjustments _colorAdjustments;

    private void Start()
    {
        volume.profile.TryGet(out _bloom);
        volume.profile.TryGet(out _vignette);
        volume.profile.TryGet(out _colorAdjustments);
    }

    public void SetBloomIntensity(float intensity)
    {
        _bloom.intensity.value = intensity;
    }

    public void SetVignette(float intensity)
    {
        _vignette.intensity.value = intensity;
    }

    public void SetSaturation(float saturation)
    {
        _colorAdjustments.saturation.value = saturation;
    }

    // Damage effect
    public IEnumerator DamageFlash()
    {
        _vignette.intensity.value = 0.5f;
        _vignette.color.value = Color.red;

        yield return new WaitForSeconds(0.1f);

        _vignette.intensity.value = 0.3f;
        _vignette.color.value = Color.black;
    }
}
```

### Post-Process Overrides

```
Volume Profile:
├── Bloom
│   ├── Intensity: 0.5
│   ├── Threshold: 0.9
│   └── Scatter: 0.7
├── Color Adjustments
│   ├── Post Exposure: 0
│   ├── Contrast: 10
│   └── Saturation: 10
├── Vignette
│   ├── Intensity: 0.3
│   └── Smoothness: 0.5
├── Depth of Field (if needed)
│   ├── Mode: Bokeh
│   └── Focus Distance: 10
└── Motion Blur (if needed)
    ├── Quality: Medium
    └── Intensity: 0.5
```

## Shader Graph

### Create Shader Graph
`Create > Shader Graph > URP > Lit Shader Graph`

### Basic Lit Setup

```
Shader Graph:
├── Vertex
│   └── Position (default)
├── Fragment
│   ├── Base Color: Texture2D → Sample Texture 2D
│   ├── Normal: Normal Map → Sample Texture 2D (Normal)
│   ├── Metallic: Float (0-1)
│   ├── Smoothness: Float (0-1)
│   └── Emission: Color (HDR)
```

### Common Nodes

```
// Texture sampling
Sample Texture 2D → Base Color

// Fresnel effect
Fresnel Effect → Add to Emission

// Dissolve effect
Simple Noise → Step → Alpha Clip Threshold

// Scrolling UV
Time × Speed → Add to UV → Sample Texture

// Vertex displacement
Position (Object) + (Normal × Height) → Position
```

### Custom Function

```hlsl
// Custom function for shader graph
void MyCustomFunction_float(float3 In, out float3 Out)
{
    Out = In * 2.0;
}
```

## Renderer Features

### Custom Renderer Feature

```csharp
public class OutlineRendererFeature : ScriptableRendererFeature
{
    [SerializeField] private Material outlineMaterial;
    [SerializeField] private LayerMask outlineLayer;

    private OutlinePass _outlinePass;

    public override void Create()
    {
        _outlinePass = new OutlinePass(outlineMaterial, outlineLayer);
        _outlinePass.renderPassEvent = RenderPassEvent.AfterRenderingOpaques;
    }

    public override void AddRenderPasses(ScriptableRenderer renderer, ref RenderingData renderingData)
    {
        renderer.EnqueuePass(_outlinePass);
    }
}

public class OutlinePass : ScriptableRenderPass
{
    private Material _material;
    private LayerMask _layerMask;

    public OutlinePass(Material material, LayerMask layerMask)
    {
        _material = material;
        _layerMask = layerMask;
    }

    public override void Execute(ScriptableRenderContext context, ref RenderingData renderingData)
    {
        var cmd = CommandBufferPool.Get("Outline");

        // Draw outlines
        // ...

        context.ExecuteCommandBuffer(cmd);
        CommandBufferPool.Release(cmd);
    }
}
```

## Performance Optimization

### Batching

```csharp
// Enable GPU Instancing on materials
material.enableInstancing = true;

// SRP Batcher (automatic for URP shaders)
// Check: Frame Debugger > SRP Batcher
```

### LOD (Level of Detail)

```csharp
// LOD Group setup
LODGroup lodGroup = gameObject.AddComponent<LODGroup>();
LOD[] lods = new LOD[3];
lods[0] = new LOD(0.6f, new[] { highDetailRenderer });
lods[1] = new LOD(0.3f, new[] { mediumDetailRenderer });
lods[2] = new LOD(0.1f, new[] { lowDetailRenderer });
lodGroup.SetLODs(lods);
```

### Occlusion Culling

```
1. Window > Rendering > Occlusion Culling
2. Mark static occluders/occludees
3. Bake
```

### Shadow Optimization

```csharp
// Disable shadows for small/distant objects
renderer.shadowCastingMode = ShadowCastingMode.Off;

// Use shadow distance
urpAsset.shadowDistance = 30f;  // Reduce for mobile
```

## Mobile Optimization

### URP Mobile Settings

```
URP Asset (Mobile):
├── Rendering
│   ├── Depth Texture: Off (unless needed)
│   ├── Opaque Texture: Off
│   └── Render Scale: 0.75-0.85
├── Quality
│   ├── HDR: Off
│   ├── Anti Aliasing: Off or 2x
│   └── MSAA: Off
├── Lighting
│   ├── Main Light: Per Pixel
│   ├── Additional Lights: Per Vertex or Disabled
│   └── Reflection Probes: Off
└── Shadows
    ├── Main Light Shadows: On
    ├── Resolution: 1024
    └── Cascade Count: 2
```

### Shader Variants

```csharp
// Strip unused shader variants
// Edit > Project Settings > Graphics > Shader Stripping
// Log Shader Compilation → Analyze and strip
```

## Best Practices

### DO
- Use SRP Batcher compatible shaders
- Bake lighting for static objects
- Use Light Layers for selective lighting
- Profile with Frame Debugger

### DON'T
- Overuse real-time shadows
- Enable features you don't need
- Use transparent materials excessively
- Ignore LOD for detailed meshes

---

*Unity URP Rendering - ULTRA-CREATE Gaming Knowledge v23.1*
