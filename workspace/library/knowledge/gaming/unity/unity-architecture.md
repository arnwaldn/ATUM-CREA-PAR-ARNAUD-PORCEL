# Unity Architecture Best Practices

## Project Structure

```
Assets/
├── _Project/                    # Underscore = top in explorer
│   ├── Art/
│   │   ├── Animations/
│   │   ├── Materials/
│   │   ├── Models/
│   │   ├── Sprites/
│   │   ├── Textures/
│   │   └── UI/
│   ├── Audio/
│   │   ├── Music/
│   │   ├── SFX/
│   │   └── Ambience/
│   ├── Prefabs/
│   │   ├── Characters/
│   │   ├── Environment/
│   │   ├── Gameplay/
│   │   └── UI/
│   ├── Scenes/
│   │   ├── _Bootstrap/         # Initialization scene
│   │   ├── MainMenu/
│   │   ├── Gameplay/
│   │   └── Loading/
│   ├── ScriptableObjects/
│   │   ├── Config/             # Game settings
│   │   ├── Events/             # Event channels
│   │   ├── Data/               # Items, enemies, etc.
│   │   └── RuntimeSets/
│   └── Scripts/
│       ├── Runtime/
│       │   ├── Core/
│       │   ├── Gameplay/
│       │   ├── Systems/
│       │   ├── UI/
│       │   └── Utils/
│       └── Editor/
├── Plugins/                     # Native plugins
├── Resources/                   # Runtime loading (use sparingly)
├── Settings/                    # Project settings, URP asset
├── StreamingAssets/            # Platform-specific assets
└── ThirdParty/                 # External packages
```

## Assembly Definitions (asmdef)

### Benefits
- Faster compilation (only recompile changed assemblies)
- Clear dependency management
- Testable architecture
- Prevents accidental dependencies

### Structure

```
Scripts/
├── Runtime/
│   ├── Game.Core.asmdef
│   │   └── References: None (or Unity packages only)
│   ├── Game.Gameplay.asmdef
│   │   └── References: Game.Core
│   ├── Game.UI.asmdef
│   │   └── References: Game.Core, TextMeshPro
│   └── Game.ThirdParty.asmdef
│       └── References: External libs
└── Editor/
    └── Game.Editor.asmdef
        └── References: Game.Core, Editor only
```

### Example asmdef

```json
{
    "name": "Game.Gameplay",
    "rootNamespace": "Game.Gameplay",
    "references": [
        "Game.Core",
        "Unity.InputSystem"
    ],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "overrideReferences": false,
    "precompiledReferences": [],
    "autoReferenced": true,
    "defineConstraints": [],
    "versionDefines": [],
    "noEngineReferences": false
}
```

## Namespace Conventions

```csharp
// Root namespace matches project
namespace Game.Core
{
    public class GameManager { }
}

namespace Game.Core.Services
{
    public interface IAudioService { }
}

namespace Game.Gameplay.Player
{
    public class PlayerController { }
}

namespace Game.UI.Menus
{
    public class MainMenuController { }
}
```

## Scene Management

### Bootstrap Pattern

```csharp
// _Bootstrap scene - always loads first
public class Bootstrapper : MonoBehaviour
{
    [SerializeField] private GameConfigSO gameConfig;

    private async void Start()
    {
        // 1. Initialize core services
        ServiceLocator.Register<IInputService>(new InputService());
        ServiceLocator.Register<IAudioService>(new AudioService());
        ServiceLocator.Register<ISaveService>(new SaveService());

        // 2. Load persistent scene (UI, managers)
        await SceneManager.LoadSceneAsync("PersistentScene", LoadSceneMode.Additive);

        // 3. Load initial gameplay scene
        await SceneManager.LoadSceneAsync(gameConfig.InitialScene, LoadSceneMode.Additive);

        // 4. Unload bootstrap
        await SceneManager.UnloadSceneAsync("_Bootstrap");
    }
}
```

### Additive Scene Loading

```csharp
public class SceneLoader : MonoBehaviour
{
    public async UniTask LoadScene(string sceneName, bool showLoading = true)
    {
        if (showLoading)
            await SceneManager.LoadSceneAsync("Loading", LoadSceneMode.Additive);

        // Unload current gameplay scene
        var currentScene = SceneManager.GetActiveScene();
        if (currentScene.name != "PersistentScene")
            await SceneManager.UnloadSceneAsync(currentScene);

        // Load new scene
        await SceneManager.LoadSceneAsync(sceneName, LoadSceneMode.Additive);
        SceneManager.SetActiveScene(SceneManager.GetSceneByName(sceneName));

        if (showLoading)
            await SceneManager.UnloadSceneAsync("Loading");
    }
}
```

## Dependency Injection (Simple)

### Service Locator Pattern

```csharp
public static class ServiceLocator
{
    private static readonly Dictionary<Type, object> Services = new();

    public static void Register<T>(T service) where T : class
    {
        Services[typeof(T)] = service;
    }

    public static T Get<T>() where T : class
    {
        if (Services.TryGetValue(typeof(T), out var service))
            return service as T;

        Debug.LogError($"Service {typeof(T)} not registered!");
        return null;
    }

    public static void Clear() => Services.Clear();
}

// Usage
ServiceLocator.Register<IInputService>(inputService);
var input = ServiceLocator.Get<IInputService>();
```

### Constructor Injection (Manual)

```csharp
public class PlayerController
{
    private readonly IInputService _input;
    private readonly IAudioService _audio;

    public PlayerController(IInputService input, IAudioService audio)
    {
        _input = input;
        _audio = audio;
    }
}

// Factory creates with dependencies
public class PlayerFactory : MonoBehaviour
{
    public PlayerController Create()
    {
        return new PlayerController(
            ServiceLocator.Get<IInputService>(),
            ServiceLocator.Get<IAudioService>()
        );
    }
}
```

## MonoBehaviour Lifecycle

```
Awake()           → Initialize self (cache components)
OnEnable()        → Subscribe to events
Start()           → Initialize with other objects
FixedUpdate()     → Physics (fixed timestep)
Update()          → Logic (every frame)
LateUpdate()      → Camera, follow logic
OnDisable()       → Unsubscribe from events
OnDestroy()       → Cleanup
```

### Best Practices

```csharp
public class Enemy : MonoBehaviour
{
    // Cache in Awake
    private Rigidbody _rb;
    private Animator _animator;

    // Events
    private VoidEventSO _onEnemyDeath;

    private void Awake()
    {
        // Cache components - NEVER in Update
        _rb = GetComponent<Rigidbody>();
        _animator = GetComponent<Animator>();
    }

    private void OnEnable()
    {
        // Subscribe to events
        GameEvents.OnPause += HandlePause;
    }

    private void OnDisable()
    {
        // ALWAYS unsubscribe
        GameEvents.OnPause -= HandlePause;
    }

    private void HandlePause(bool isPaused) { }
}
```

## Prefab Workflow

### Prefab Variants

```
Prefabs/
├── Characters/
│   ├── _BaseEnemy.prefab       # Base prefab
│   ├── Goblin.prefab           # Variant of _BaseEnemy
│   ├── Orc.prefab              # Variant of _BaseEnemy
│   └── Boss.prefab             # Variant with overrides
```

### Nested Prefabs

```
Prefabs/
├── Environment/
│   ├── Props/
│   │   ├── Barrel.prefab
│   │   └── Crate.prefab
│   └── Rooms/
│       └── DungeonRoom.prefab  # Contains Barrel, Crate
```

## Editor Best Practices

### Custom Inspector Attributes

```csharp
public class PlayerStats : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField, Range(1f, 20f)] private float speed = 5f;
    [SerializeField, Tooltip("Jump force")] private float jumpForce = 10f;

    [Header("Combat")]
    [SerializeField] private int maxHealth = 100;

    [Space(10)]
    [SerializeField, TextArea(3, 5)] private string description;

    [Header("Debug")]
    [SerializeField, ReadOnly] private bool isGrounded;  // Custom attribute
}
```

### Scriptable Object Menu

```csharp
[CreateAssetMenu(fileName = "NewItem", menuName = "Game/Items/Item Data")]
public class ItemDataSO : ScriptableObject
{
    public string itemName;
    public Sprite icon;
    public int value;
}
```

---

*Unity Architecture - ULTRA-CREATE Gaming Knowledge v23.1*
