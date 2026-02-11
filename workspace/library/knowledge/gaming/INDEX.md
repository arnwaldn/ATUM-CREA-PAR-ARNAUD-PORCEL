# Gaming Knowledge Base - Index

> 43 fichiers | 12 categories | ULTRA-CREATE v24.1

---

## Categories

| Dossier | Fichiers | Contenu |
|---------|----------|---------|
| `blender/` | 1 | Addons Blender (38 recommandes) |
| `genres/` | 4 | Platformer, Puzzle, Roguelike, Shooter |
| `multiplayer/` | 4 | Architecture, Lag, Prediction, State sync |
| `patterns/` | 6 | ECS, Game loop, State machine, Pooling, Command, Event bus |
| `physics/` | 4 | Collision, Engines, Platformer, Projectile |
| `procedural/` | 3 | Dungeon, Terrain, Loot tables |
| `references/` | 5 | 2048, Tetris, Snake, BrowserQuest, Phaser best practices |
| `rendering/` | 4 | Path Tracing, Global Illumination, Render Graph, Shader Techniques |
| `resources/` | 1 | Official Graphics Repos (DirectX, Vulkan, OpenGL, WebGPU, Metal) |
| `tools/` | 2 | Bfxr (sound), Tiled (level editor) |
| `unity/` | 8 | Architecture, ECS-DOTS, Input, Multiplayer, URP, VR/AR, ScriptableObjects, Addressables |
| `unreal/` | 1 | UE5 Resources (Nanite, Lumen, plugins) |

---

## Utilisation par Type de Projet

| Demande Utilisateur | Fichiers a Consulter |
|---------------------|----------------------|
| "jeu 2D" | `patterns/`, `physics/`, `genres/`, `references/phaser-best-practices` |
| "jeu 3D web" | `rendering/`, `patterns/`, `unity/urp-rendering` |
| "jeu Unity" | `unity/*`, `rendering/*` |
| "jeu Unreal" | `unreal/*`, `rendering/*` |
| "multijoueur" | `multiplayer/*`, `patterns/state-machine` |
| "procedural" | `procedural/*`, `patterns/entity-component-system` |
| "asset 3D" | `blender/*`, `rendering/*` |
| "roguelike" | `genres/roguelike`, `procedural/*`, `patterns/*` |
| "platformer" | `genres/platformer`, `physics/platformer-physics`, `patterns/*` |
| "puzzle" | `genres/puzzle`, `patterns/state-machine` |
| "shooter" | `genres/shooter`, `physics/projectile-motion`, `multiplayer/*` |
| "jeu stylise" | `rendering/shader-techniques`, `genres/*`, `patterns/*` |
| "post-processing" | `rendering/shader-techniques`, `rendering/render-graph` |

---

## Fichiers par Categorie

### blender/ (1)
- `blender-addons.md` - 38 addons recommandes (TexTools, Sorcar, BEER, AI-Render...)

### genres/ (4)
- `platformer.md` - Mecaniques platformer, level design
- `puzzle.md` - Puzzle game patterns
- `roguelike.md` - Roguelike mechanics, procgen
- `shooter.md` - Shooter mechanics, projectiles

### multiplayer/ (4)
- `architecture.md` - Client-server, P2P, authoritative
- `lag-compensation.md` - Techniques de compensation lag
- `prediction.md` - Client-side prediction
- `state-sync.md` - Synchronisation d'etat

### patterns/ (6)
- `command-pattern.md` - Undo/redo, replays
- `entity-component-system.md` - ECS architecture
- `event-bus.md` - Communication decouplée
- `game-loop.md` - Fixed timestep, interpolation
- `object-pooling.md` - Performance memory
- `state-machine.md` - FSM, comportements

### physics/ (4)
- `collision-detection.md` - AABB, SAT, spatial hashing
- `physics-engines.md` - Box2D, Matter.js, Cannon-es
- `platformer-physics.md` - Jump, coyote time, gravity
- `projectile-motion.md` - Trajectoires, hitscan

### procedural/ (3)
- `dungeon-generation.md` - BSP, cellular automata, rooms
- `loot-tables.md` - Weighted random, rarity
- `terrain.md` - Noise, heightmaps, biomes

### references/ (5)
- `2048.md` - Implementation complete
- `browserquest.md` - MMO architecture reference
- `phaser-best-practices.md` - Patterns Phaser 3
- `snake.md` - Implementation complete
- `tetris.md` - Implementation complete

### rendering/ (4)
- `global-illumination.md` - VCT, DDGI, LPV, Radiance Cache, Surfel GI
- `path-tracing.md` - pbrt, Mitsuba, embree, kajiya, ReSTIR
- `render-graph.md` - Frame Graph patterns, resource management
- `shader-techniques.md` - 33 techniques GLSL (lighting, post-processing, stylization)

### resources/ (1)
- `official-graphics-repos.md` - DirectX, Vulkan, OpenGL, WebGPU, Metal, NVIDIA, AMD, Intel

### tools/ (2)
- `bfxr.md` - Generation effets sonores
- `tiled.md` - Level editor integration

### unity/ (8)
- `addressables.md` - Asset management
- `architecture.md` - Project structure, managers
- `ecs-dots.md` - Data-Oriented Tech Stack
- `input-system.md` - New Input System
- `multiplayer.md` - Netcode for GameObjects, Transport
- `scriptableobjects.md` - Data containers
- `urp-rendering.md` - Universal Render Pipeline
- `vr-ar.md` - XR development

### unreal/ (1)
- `unreal-resources.md` - UE5 features (Nanite, Lumen), plugins, C++ patterns

---

## Integration Systeme

### Slash Commands
- `/game` - Utilise cette knowledge base automatiquement
- `/3d` - Reference `blender/`, `rendering/`, `resources/`

### Agents
- `game-architect` - Consulte `patterns/`, `genres/`
- `phaser-expert` - Consulte `references/phaser-best-practices`
- `three-js-expert` - Consulte `rendering/`
- `unity-expert` - Consulte `unity/*`
- `procgen-expert` - Consulte `procedural/*`
- `networking-expert` - Consulte `multiplayer/*`
- `3d-artist` - Consulte `blender/*`, `rendering/*`

### Tool Registry Mapping
```yaml
"jeu 2D": knowledge: ["patterns/", "physics/", "genres/"]
"jeu 3D": knowledge: ["unity/", "rendering/", "blender/"]
"multijoueur": knowledge: ["multiplayer/", "patterns/state-machine"]
"asset 3D": knowledge: ["blender/", "rendering/", "resources/"]
```

---

*ULTRA-CREATE Gaming Knowledge v24.1 - Index genere le 27 Decembre 2025*
