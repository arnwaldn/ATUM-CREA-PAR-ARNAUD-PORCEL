# Unity Addressables

## Overview

Addressables = Modern asset management system for:
- Async loading
- Memory management
- Content updates
- Remote asset hosting

## Setup

```
Window > Package Manager > Addressables
Window > Asset Management > Addressables > Groups
```

### Create Settings

```csharp
// Via code (usually done in Editor)
AddressableAssetSettings.Create(
    AddressableAssetSettingsDefaultObject.kDefaultConfigFolder,
    AddressableAssetSettingsDefaultObject.kDefaultConfigAssetName,
    true, true
);
```

## Basic Loading

### Load Single Asset

```csharp
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class AssetLoader : MonoBehaviour
{
    // Via Inspector
    [SerializeField] private AssetReference prefabReference;

    // Via string address
    public async void LoadByAddress()
    {
        var handle = Addressables.LoadAssetAsync<GameObject>("Prefabs/Enemy");
        await handle.Task;

        if (handle.Status == AsyncOperationStatus.Succeeded)
        {
            var prefab = handle.Result;
            Instantiate(prefab);
        }
    }

    // Via AssetReference
    public async void LoadByReference()
    {
        var handle = prefabReference.LoadAssetAsync<GameObject>();
        await handle.Task;

        if (handle.Status == AsyncOperationStatus.Succeeded)
        {
            Instantiate(handle.Result);
        }
    }

    // Callback style
    public void LoadWithCallback()
    {
        Addressables.LoadAssetAsync<GameObject>("Prefabs/Enemy").Completed += handle =>
        {
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                Instantiate(handle.Result);
            }
        };
    }
}
```

### Instantiate Directly

```csharp
// Load and instantiate in one call
public async void SpawnEnemy()
{
    var handle = Addressables.InstantiateAsync("Prefabs/Enemy", transform.position, Quaternion.identity);
    await handle.Task;

    var enemy = handle.Result;
    // enemy is now in scene
}
```

## Asset References

### Basic Reference

```csharp
[Serializable]
public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private AssetReference enemyPrefab;
    [SerializeField] private AssetReferenceSprite bossIcon;
    [SerializeField] private AssetReferenceTexture2D skyboxTexture;

    private AsyncOperationHandle<GameObject> _handle;

    public async Task<GameObject> SpawnEnemy()
    {
        _handle = enemyPrefab.InstantiateAsync(transform.position, Quaternion.identity);
        return await _handle.Task;
    }

    private void OnDestroy()
    {
        // Release when done
        if (_handle.IsValid())
            Addressables.Release(_handle);
    }
}
```

### Component Reference

```csharp
// Reference specific component type
[Serializable]
public class AssetReferenceAudioClip : AssetReferenceT<AudioClip>
{
    public AssetReferenceAudioClip(string guid) : base(guid) { }
}

public class AudioManager : MonoBehaviour
{
    [SerializeField] private AssetReferenceAudioClip backgroundMusic;

    public async void PlayMusic()
    {
        var clip = await backgroundMusic.LoadAssetAsync().Task;
        AudioSource.PlayClipAtPoint(clip, Vector3.zero);
    }
}
```

## Loading Multiple Assets

### Load by Label

```csharp
public async Task<IList<GameObject>> LoadAllEnemies()
{
    var handle = Addressables.LoadAssetsAsync<GameObject>(
        "enemies",  // Label
        obj => Debug.Log($"Loaded: {obj.name}")  // Callback per asset
    );

    return await handle.Task;
}
```

### Load Multiple by Address

```csharp
public async Task LoadMultiple()
{
    var keys = new List<string> { "Prefabs/Enemy1", "Prefabs/Enemy2", "Prefabs/Enemy3" };

    var handle = Addressables.LoadAssetsAsync<GameObject>(
        keys,
        null,
        Addressables.MergeMode.Union
    );

    var results = await handle.Task;
    foreach (var prefab in results)
    {
        Debug.Log($"Loaded: {prefab.name}");
    }
}
```

## Scene Loading

```csharp
using UnityEngine.ResourceManagement.ResourceProviders;

public class SceneLoader : MonoBehaviour
{
    private AsyncOperationHandle<SceneInstance> _sceneHandle;

    public async Task LoadScene(string sceneAddress)
    {
        // Load additively
        _sceneHandle = Addressables.LoadSceneAsync(
            sceneAddress,
            LoadSceneMode.Additive
        );

        await _sceneHandle.Task;
    }

    public async Task UnloadScene()
    {
        if (_sceneHandle.IsValid())
        {
            await Addressables.UnloadSceneAsync(_sceneHandle).Task;
        }
    }
}
```

## Memory Management

### Release Assets

```csharp
public class AssetManager : MonoBehaviour
{
    private Dictionary<string, AsyncOperationHandle> _loadedAssets = new();

    public async Task<T> LoadAsset<T>(string address)
    {
        var handle = Addressables.LoadAssetAsync<T>(address);
        await handle.Task;

        _loadedAssets[address] = handle;
        return handle.Result;
    }

    public void ReleaseAsset(string address)
    {
        if (_loadedAssets.TryGetValue(address, out var handle))
        {
            Addressables.Release(handle);
            _loadedAssets.Remove(address);
        }
    }

    public void ReleaseAll()
    {
        foreach (var handle in _loadedAssets.Values)
        {
            Addressables.Release(handle);
        }
        _loadedAssets.Clear();
    }

    private void OnDestroy()
    {
        ReleaseAll();
    }
}
```

### Release Instantiated Objects

```csharp
// For objects created with InstantiateAsync
public void DestroyEnemy(GameObject enemy)
{
    // Use this instead of Destroy()
    Addressables.ReleaseInstance(enemy);
}
```

## Remote Content

### Configure for Remote

1. **Addressables Groups** > Create New Group > "Remote"
2. Set Build Path: `RemoteBuildPath`
3. Set Load Path: `RemoteLoadPath`
4. Mark assets as remote group

### Profile Settings

```
// Edit > Addressables > Profiles
RemoteBuildPath: ServerData/[BuildTarget]
RemoteLoadPath: https://myserver.com/[BuildTarget]
```

### Check for Updates

```csharp
public class ContentUpdater : MonoBehaviour
{
    public async Task<bool> CheckForUpdates()
    {
        var handle = Addressables.CheckForCatalogUpdates(false);
        var catalogs = await handle.Task;

        Addressables.Release(handle);
        return catalogs.Count > 0;
    }

    public async Task UpdateContent()
    {
        var checkHandle = Addressables.CheckForCatalogUpdates(false);
        var catalogs = await checkHandle.Task;

        if (catalogs.Count > 0)
        {
            var updateHandle = Addressables.UpdateCatalogs(catalogs, false);
            await updateHandle.Task;
            Addressables.Release(updateHandle);
        }

        Addressables.Release(checkHandle);
    }
}
```

### Download Before Play

```csharp
public async Task PreloadContent(string label, Action<float> onProgress)
{
    // Get download size
    var sizeHandle = Addressables.GetDownloadSizeAsync(label);
    var size = await sizeHandle.Task;

    if (size > 0)
    {
        // Download
        var downloadHandle = Addressables.DownloadDependenciesAsync(label);

        while (!downloadHandle.IsDone)
        {
            onProgress?.Invoke(downloadHandle.PercentComplete);
            await Task.Yield();
        }

        Addressables.Release(downloadHandle);
    }

    Addressables.Release(sizeHandle);
}
```

## Best Practices

### Organization

```
Assets/
├── AddressableAssets/
│   ├── Prefabs/
│   │   ├── Characters/     → Label: "characters"
│   │   ├── Environment/    → Label: "environment"
│   │   └── UI/             → Label: "ui"
│   ├── Audio/              → Label: "audio"
│   └── Scenes/             → Label: "scenes"
```

### Loading Patterns

```csharp
public class GameLoader : MonoBehaviour
{
    [SerializeField] private List<AssetLabelReference> preloadLabels;

    public async Task PreloadGame()
    {
        var tasks = new List<Task>();

        foreach (var label in preloadLabels)
        {
            var handle = Addressables.LoadAssetsAsync<UnityEngine.Object>(
                label,
                null
            );
            tasks.Add(handle.Task);
        }

        await Task.WhenAll(tasks);
    }
}
```

### Memory-Efficient Loading

```csharp
// Load, use, release pattern
public async Task ProcessLevelData(string levelAddress)
{
    var handle = Addressables.LoadAssetAsync<LevelDataSO>(levelAddress);
    var data = await handle.Task;

    // Use the data
    ProcessLevel(data);

    // Release immediately if not needed anymore
    Addressables.Release(handle);
}
```

### Error Handling

```csharp
public async Task<GameObject> SafeLoad(string address)
{
    try
    {
        var handle = Addressables.LoadAssetAsync<GameObject>(address);
        await handle.Task;

        if (handle.Status == AsyncOperationStatus.Succeeded)
        {
            return handle.Result;
        }
        else
        {
            Debug.LogError($"Failed to load: {address}");
            return null;
        }
    }
    catch (Exception e)
    {
        Debug.LogError($"Exception loading {address}: {e.Message}");
        return null;
    }
}
```

---

*Unity Addressables - ULTRA-CREATE Gaming Knowledge v23.1*
