# Render Graph / Frame Graph

> Modern rendering architecture for GPU resource management

---

## Concept

A Render Graph is a directed acyclic graph (DAG) where:
- **Nodes** = Render passes
- **Edges** = Resource dependencies

### Benefits
- Automatic resource lifetime management
- Barrier/synchronization optimization
- Memory aliasing (reuse textures)
- Easy pass culling
- Multi-threaded command recording

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  GBuffer    │────▶│   Shadows   │────▶│  Lighting   │
│    Pass     │     │    Pass     │     │    Pass     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  [Albedo RT]         [ShadowMap]         [HDR Buffer]
  [Normal RT]
  [Depth RT]
       │                                       │
       └───────────────────────────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Post-Process   │
                 │      Pass       │
                 └─────────────────┘
                          │
                          ▼
                    [Final Output]
```

---

## Implementation

### Resource Handle

```cpp
// Transient resource handle
struct RenderGraphHandle {
    uint32_t index;
    uint32_t version;  // Detect stale handles

    bool isValid() const { return index != INVALID_INDEX; }
};

// Resource description
struct TextureDesc {
    uint32_t width, height;
    Format format;
    TextureUsage usage;
    bool isTransient;  // Managed by graph vs persistent
};
```

### Pass Definition

```cpp
// Render pass base
class RenderPass {
public:
    virtual void setup(RenderGraphBuilder& builder) = 0;
    virtual void execute(RenderContext& ctx) = 0;

    std::vector<RenderGraphHandle> reads;
    std::vector<RenderGraphHandle> writes;
};

// Example: GBuffer pass
class GBufferPass : public RenderPass {
    RenderGraphHandle albedo, normal, depth;

    void setup(RenderGraphBuilder& builder) override {
        // Declare outputs
        albedo = builder.createTexture(TextureDesc{
            .width = screenWidth,
            .height = screenHeight,
            .format = Format::RGBA8,
            .usage = TextureUsage::RenderTarget | TextureUsage::ShaderRead
        });

        normal = builder.createTexture(TextureDesc{
            .width = screenWidth,
            .height = screenHeight,
            .format = Format::RGB10A2,
            .usage = TextureUsage::RenderTarget | TextureUsage::ShaderRead
        });

        depth = builder.createTexture(TextureDesc{
            .width = screenWidth,
            .height = screenHeight,
            .format = Format::D32,
            .usage = TextureUsage::DepthStencil | TextureUsage::ShaderRead
        });

        builder.writeTexture(albedo);
        builder.writeTexture(normal);
        builder.writeTexture(depth);
    }

    void execute(RenderContext& ctx) override {
        // Actual rendering
        ctx.setRenderTargets({albedo, normal}, depth);
        ctx.drawScene(OPAQUE_GEOMETRY);
    }
};
```

### Graph Builder

```cpp
class RenderGraphBuilder {
    std::vector<std::unique_ptr<RenderPass>> passes;
    std::vector<TextureDesc> textureDescs;
    std::vector<ResourceState> resourceStates;

public:
    RenderGraphHandle createTexture(const TextureDesc& desc) {
        RenderGraphHandle handle{
            .index = (uint32_t)textureDescs.size(),
            .version = currentVersion++
        };
        textureDescs.push_back(desc);
        return handle;
    }

    template<typename T, typename... Args>
    T& addPass(Args&&... args) {
        auto pass = std::make_unique<T>(std::forward<Args>(args)...);
        T& ref = *pass;
        passes.push_back(std::move(pass));
        return ref;
    }

    void readTexture(RenderGraphHandle handle) {
        currentPass->reads.push_back(handle);
    }

    void writeTexture(RenderGraphHandle handle) {
        currentPass->writes.push_back(handle);
    }

    RenderGraph compile();
};
```

### Compilation

```cpp
class RenderGraph {
public:
    void compile() {
        // 1. Topological sort passes
        sortPasses();

        // 2. Calculate resource lifetimes
        for (auto& pass : passes) {
            for (auto& read : pass->reads) {
                resourceLifetimes[read.index].lastUse = pass;
            }
            for (auto& write : pass->writes) {
                resourceLifetimes[write.index].firstUse = pass;
            }
        }

        // 3. Memory aliasing
        allocateResources();

        // 4. Insert barriers
        insertBarriers();
    }

    void execute(CommandList& cmd) {
        for (auto& pass : sortedPasses) {
            // Insert barriers before pass
            for (auto& barrier : pass->barriers) {
                cmd.resourceBarrier(barrier);
            }

            // Execute pass
            pass->execute(cmd);
        }
    }

private:
    void insertBarriers() {
        for (auto& pass : sortedPasses) {
            for (auto& read : pass->reads) {
                auto prevState = getLastState(read);
                auto newState = ResourceState::ShaderRead;

                if (prevState != newState) {
                    pass->barriers.push_back({
                        .resource = read,
                        .before = prevState,
                        .after = newState
                    });
                }
            }
        }
    }
};
```

---

## Memory Aliasing

```cpp
// Reuse memory between non-overlapping resources
void allocateResources() {
    MemoryPool pool;

    for (auto& resource : sortedResources) {
        // Find available memory block
        size_t size = calculateSize(resource);
        size_t alignment = getAlignment(resource.format);

        // Check if any freed block fits
        MemoryBlock* block = pool.findFreeBlock(size, alignment, resource.lifetime);

        if (block) {
            // Reuse existing memory
            resource.allocation = block;
            block->currentOwner = resource.index;
        } else {
            // Allocate new memory
            resource.allocation = pool.allocate(size, alignment);
        }

        // Mark for reuse when lifetime ends
        pool.scheduleRelease(resource.allocation, resource.lifetime.end);
    }
}
```

---

## Engine Implementations

| Engine | Name | Language |
|--------|------|----------|
| **Frostbite** | Frame Graph | C++ |
| **Unreal 5** | RDG (Render Dependency Graph) | C++ |
| **Unity HDRP** | Render Graph | C# |
| **Godot 4** | Render Graph | C++/GDScript |
| **Filament** | Frame Graph | C++ |
| **bgfx** | Frame Buffer | C/C++ |

### Open Source References

| Project | URL |
|---------|-----|
| **FrameGraph** | [GitHub](https://github.com/skaarj1989/FrameGraph) |
| **fg** | [GitHub](https://github.com/acdemiralp/fg) |
| **Granite** | [GitHub](https://github.com/Themaister/Granite) |

---

## Vulkan Integration

```cpp
// Vulkan barrier generation
VkImageMemoryBarrier createBarrier(
    RenderGraphHandle resource,
    ResourceState before,
    ResourceState after
) {
    VkImageMemoryBarrier barrier{};
    barrier.sType = VK_STRUCTURE_TYPE_IMAGE_MEMORY_BARRIER;
    barrier.image = getVkImage(resource);
    barrier.oldLayout = toVkLayout(before);
    barrier.newLayout = toVkLayout(after);
    barrier.srcAccessMask = toVkAccess(before);
    barrier.dstAccessMask = toVkAccess(after);
    barrier.subresourceRange = {VK_IMAGE_ASPECT_COLOR_BIT, 0, 1, 0, 1};

    return barrier;
}

VkImageLayout toVkLayout(ResourceState state) {
    switch (state) {
        case ResourceState::Undefined: return VK_IMAGE_LAYOUT_UNDEFINED;
        case ResourceState::RenderTarget: return VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;
        case ResourceState::DepthWrite: return VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
        case ResourceState::ShaderRead: return VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
        case ResourceState::Present: return VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;
        default: return VK_IMAGE_LAYOUT_GENERAL;
    }
}
```

---

## Best Practices

### DO
- Declare all resources upfront
- Use transient resources when possible
- Group similar passes for batching
- Profile pass execution times

### DON'T
- Create resources mid-frame
- Forget to declare reads/writes
- Overcomplicate pass dependencies
- Ignore memory aliasing opportunities

---

## Debugging

```cpp
// Visualization export (DOT format)
void exportToDot(const RenderGraph& graph, const char* filename) {
    FILE* f = fopen(filename, "w");
    fprintf(f, "digraph RenderGraph {\n");

    for (auto& pass : graph.passes) {
        fprintf(f, "  \"%s\" [shape=box];\n", pass->name);

        for (auto& write : pass->writes) {
            for (auto& nextPass : findReaders(write)) {
                fprintf(f, "  \"%s\" -> \"%s\" [label=\"%s\"];\n",
                    pass->name, nextPass->name, getResourceName(write));
            }
        }
    }

    fprintf(f, "}\n");
    fclose(f);
}
// Generate with: dot -Tpng render_graph.dot -o render_graph.png
```

---

*ULTRA-CREATE Gaming Knowledge v24.1*
