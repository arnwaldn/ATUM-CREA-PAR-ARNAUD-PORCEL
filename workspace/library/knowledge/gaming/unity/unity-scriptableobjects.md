# Unity ScriptableObjects Patterns

## Overview

ScriptableObjects are data containers that live outside scenes, enabling:
- Data-driven design
- Decoupled architecture
- Easy testing and tweaking
- Memory efficiency (shared data)

## Event Channels

### Void Event

```csharp
// Event with no parameters
[CreateAssetMenu(menuName = "Events/Void Event")]
public class VoidEventSO : ScriptableObject
{
    private readonly List<Action> _listeners = new();

    public void Raise()
    {
        for (int i = _listeners.Count - 1; i >= 0; i--)
            _listeners[i]?.Invoke();
    }

    public void RegisterListener(Action listener) => _listeners.Add(listener);
    public void UnregisterListener(Action listener) => _listeners.Remove(listener);
}

// Listener component
public class VoidEventListener : MonoBehaviour
{
    [SerializeField] private VoidEventSO eventChannel;
    [SerializeField] private UnityEvent response;

    private void OnEnable() => eventChannel.RegisterListener(OnEventRaised);
    private void OnDisable() => eventChannel.UnregisterListener(OnEventRaised);
    private void OnEventRaised() => response?.Invoke();
}
```

### Generic Event

```csharp
// Generic event channel
public abstract class GameEventSO<T> : ScriptableObject
{
    private readonly List<Action<T>> _listeners = new();

    public void Raise(T value)
    {
        for (int i = _listeners.Count - 1; i >= 0; i--)
            _listeners[i]?.Invoke(value);
    }

    public void RegisterListener(Action<T> listener) => _listeners.Add(listener);
    public void UnregisterListener(Action<T> listener) => _listeners.Remove(listener);
}

// Specific implementations
[CreateAssetMenu(menuName = "Events/Int Event")]
public class IntEventSO : GameEventSO<int> { }

[CreateAssetMenu(menuName = "Events/Float Event")]
public class FloatEventSO : GameEventSO<float> { }

[CreateAssetMenu(menuName = "Events/String Event")]
public class StringEventSO : GameEventSO<string> { }

[CreateAssetMenu(menuName = "Events/Vector3 Event")]
public class Vector3EventSO : GameEventSO<Vector3> { }
```

### Usage Example

```csharp
// Player health system
public class PlayerHealth : MonoBehaviour
{
    [SerializeField] private IntEventSO onHealthChanged;
    [SerializeField] private VoidEventSO onPlayerDeath;

    private int _currentHealth = 100;

    public void TakeDamage(int damage)
    {
        _currentHealth -= damage;
        onHealthChanged.Raise(_currentHealth);

        if (_currentHealth <= 0)
            onPlayerDeath.Raise();
    }
}

// UI listens to events (no direct reference to Player)
public class HealthUI : MonoBehaviour
{
    [SerializeField] private IntEventSO onHealthChanged;
    [SerializeField] private TextMeshProUGUI healthText;

    private void OnEnable() => onHealthChanged.RegisterListener(UpdateHealth);
    private void OnDisable() => onHealthChanged.UnregisterListener(UpdateHealth);

    private void UpdateHealth(int health) => healthText.text = $"HP: {health}";
}
```

## Runtime Sets

Track objects at runtime without Find or static lists.

```csharp
// Generic runtime set
public abstract class RuntimeSetSO<T> : ScriptableObject
{
    [NonSerialized] private readonly List<T> _items = new();

    public IReadOnlyList<T> Items => _items;
    public int Count => _items.Count;

    public void Add(T item)
    {
        if (!_items.Contains(item))
            _items.Add(item);
    }

    public void Remove(T item) => _items.Remove(item);
    public void Clear() => _items.Clear();
}

// Enemy runtime set
[CreateAssetMenu(menuName = "Runtime Sets/Enemy Set")]
public class EnemyRuntimeSetSO : RuntimeSetSO<Enemy> { }

// Usage in Enemy
public class Enemy : MonoBehaviour
{
    [SerializeField] private EnemyRuntimeSetSO enemySet;

    private void OnEnable() => enemySet.Add(this);
    private void OnDisable() => enemySet.Remove(this);
}

// Usage in GameManager
public class GameManager : MonoBehaviour
{
    [SerializeField] private EnemyRuntimeSetSO enemySet;

    public void CheckWinCondition()
    {
        if (enemySet.Count == 0)
            WinGame();
    }

    public void DamageAllEnemies(int damage)
    {
        foreach (var enemy in enemySet.Items)
            enemy.TakeDamage(damage);
    }
}
```

## Variable References

Decouple values from sources.

```csharp
// Float variable
[CreateAssetMenu(menuName = "Variables/Float Variable")]
public class FloatVariableSO : ScriptableObject
{
    [SerializeField] private float initialValue;
    [NonSerialized] private float _runtimeValue;

    public float Value
    {
        get => _runtimeValue;
        set => _runtimeValue = value;
    }

    private void OnEnable() => _runtimeValue = initialValue;

#if UNITY_EDITOR
    // Debug in inspector
    public void SetValue(float value) => Value = value;
#endif
}

// Float reference (can be constant or variable)
[Serializable]
public class FloatReference
{
    public bool UseConstant = true;
    public float ConstantValue;
    public FloatVariableSO Variable;

    public float Value => UseConstant ? ConstantValue : Variable.Value;

    public static implicit operator float(FloatReference reference) => reference.Value;
}

// Usage
public class PlayerMovement : MonoBehaviour
{
    [SerializeField] private FloatReference moveSpeed;  // Can be constant or SO

    private void Update()
    {
        float speed = moveSpeed;  // Implicit conversion
        transform.Translate(Vector3.forward * speed * Time.deltaTime);
    }
}
```

## Data Containers

### Item Data

```csharp
[CreateAssetMenu(menuName = "Game/Items/Item Data")]
public class ItemDataSO : ScriptableObject
{
    [Header("Basic Info")]
    public string itemName;
    [TextArea] public string description;
    public Sprite icon;

    [Header("Stats")]
    public ItemType type;
    public ItemRarity rarity;
    public int value;
    public int stackLimit = 99;

    [Header("Effects")]
    public List<ItemEffectSO> effects;
}

public enum ItemType { Consumable, Equipment, Quest, Material }
public enum ItemRarity { Common, Uncommon, Rare, Epic, Legendary }
```

### Character Stats

```csharp
[CreateAssetMenu(menuName = "Game/Characters/Character Stats")]
public class CharacterStatsSO : ScriptableObject
{
    [Header("Base Stats")]
    public int maxHealth = 100;
    public int maxMana = 50;
    public float moveSpeed = 5f;

    [Header("Combat")]
    public int attackPower = 10;
    public int defense = 5;
    public float attackSpeed = 1f;

    [Header("Progression")]
    public AnimationCurve levelCurve;

    public int GetStatAtLevel(int level, int baseStat)
    {
        return Mathf.RoundToInt(baseStat * levelCurve.Evaluate(level / 100f));
    }
}
```

### Game Configuration

```csharp
[CreateAssetMenu(menuName = "Game/Config/Game Config")]
public class GameConfigSO : ScriptableObject
{
    [Header("Scenes")]
    public string mainMenuScene = "MainMenu";
    public string gameplayScene = "Gameplay";

    [Header("Gameplay")]
    public float respawnDelay = 3f;
    public int maxLives = 3;

    [Header("Audio")]
    [Range(0, 1)] public float defaultMusicVolume = 0.8f;
    [Range(0, 1)] public float defaultSFXVolume = 1f;

    [Header("Debug")]
    public bool showDebugInfo;
    public bool invincibleMode;
}
```

## Inventory System

```csharp
// Inventory slot
[Serializable]
public class InventorySlot
{
    public ItemDataSO item;
    public int quantity;

    public bool IsEmpty => item == null || quantity <= 0;
}

// Inventory as ScriptableObject (persistent)
[CreateAssetMenu(menuName = "Game/Inventory")]
public class InventorySO : ScriptableObject
{
    [SerializeField] private List<InventorySlot> slots = new();
    [SerializeField] private int maxSlots = 20;

    public event Action OnInventoryChanged;

    public bool AddItem(ItemDataSO item, int quantity = 1)
    {
        // Try stack
        var existingSlot = slots.Find(s => s.item == item && s.quantity < item.stackLimit);
        if (existingSlot != null)
        {
            existingSlot.quantity = Mathf.Min(existingSlot.quantity + quantity, item.stackLimit);
            OnInventoryChanged?.Invoke();
            return true;
        }

        // New slot
        if (slots.Count < maxSlots)
        {
            slots.Add(new InventorySlot { item = item, quantity = quantity });
            OnInventoryChanged?.Invoke();
            return true;
        }

        return false;  // Inventory full
    }

    public bool RemoveItem(ItemDataSO item, int quantity = 1)
    {
        var slot = slots.Find(s => s.item == item);
        if (slot == null || slot.quantity < quantity)
            return false;

        slot.quantity -= quantity;
        if (slot.quantity <= 0)
            slots.Remove(slot);

        OnInventoryChanged?.Invoke();
        return true;
    }
}
```

## Audio Configuration

```csharp
[CreateAssetMenu(menuName = "Audio/Sound Effect")]
public class SoundEffectSO : ScriptableObject
{
    [Header("Clips")]
    public AudioClip[] clips;

    [Header("Settings")]
    [Range(0, 1)] public float volume = 1f;
    [Range(0, 3)] public float pitch = 1f;
    [Range(0, 0.5f)] public float pitchVariation = 0.1f;

    public AudioClip GetClip()
    {
        return clips[Random.Range(0, clips.Length)];
    }

    public float GetPitch()
    {
        return pitch + Random.Range(-pitchVariation, pitchVariation);
    }
}

// Usage
public class AudioManager : MonoBehaviour
{
    public void PlaySFX(SoundEffectSO sfx, Vector3 position)
    {
        AudioSource.PlayClipAtPoint(sfx.GetClip(), position, sfx.volume);
    }
}
```

## Best Practices

### DO
- Use SO for shared data across objects
- Use SO events for decoupled communication
- Reset runtime values in OnEnable
- Use [NonSerialized] for runtime-only data

### DON'T
- Store scene references in SO
- Modify SO data at runtime in builds (use runtime copies)
- Use SO for per-instance data (use MonoBehaviour)

### Runtime Copy Pattern

```csharp
public class Character : MonoBehaviour
{
    [SerializeField] private CharacterStatsSO baseStats;
    private CharacterStatsSO _runtimeStats;

    private void Awake()
    {
        // Create runtime copy
        _runtimeStats = Instantiate(baseStats);
    }

    private void OnDestroy()
    {
        // Cleanup
        Destroy(_runtimeStats);
    }
}
```

---

*Unity ScriptableObjects - ULTRA-CREATE Gaming Knowledge v23.1*
