# Unity DOTS (Data-Oriented Technology Stack)

## Overview

DOTS = Entities + Jobs + Burst for high-performance code.

| Component | Purpose |
|-----------|---------|
| **Entities** | ECS architecture (data-oriented) |
| **Jobs** | Multi-threaded execution |
| **Burst** | High-performance compilation |

## When to Use DOTS

### Use DOTS
- Thousands of similar entities (enemies, bullets, particles)
- CPU-bound simulations
- Physics-heavy games
- Large-scale worlds

### Use MonoBehaviour
- UI systems
- Single-instance managers
- Rapid prototyping
- Small games (<100 entities)

## Entities Package Setup

```json
// Packages/manifest.json
{
  "dependencies": {
    "com.unity.entities": "1.2.0",
    "com.unity.entities.graphics": "1.2.0",
    "com.unity.physics": "1.2.0",
    "com.unity.burst": "1.8.0",
    "com.unity.collections": "2.2.0"
  }
}
```

## ECS Basics

### Components (Data Only)

```csharp
using Unity.Entities;
using Unity.Mathematics;

// IComponentData for unmanaged data
public struct Position : IComponentData
{
    public float3 Value;
}

public struct Velocity : IComponentData
{
    public float3 Value;
}

public struct Health : IComponentData
{
    public int Current;
    public int Max;
}

public struct Speed : IComponentData
{
    public float Value;
}

// Tag component (no data, just marker)
public struct PlayerTag : IComponentData { }
public struct EnemyTag : IComponentData { }
```

### Systems (Logic)

```csharp
using Unity.Entities;
using Unity.Transforms;
using Unity.Burst;

// ISystem for Burst-compiled systems
[BurstCompile]
public partial struct MovementSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        float deltaTime = SystemAPI.Time.DeltaTime;

        // Query all entities with Position and Velocity
        foreach (var (transform, velocity) in
            SystemAPI.Query<RefRW<LocalTransform>, RefRO<Velocity>>())
        {
            transform.ValueRW.Position += velocity.ValueRO.Value * deltaTime;
        }
    }
}

// Alternative with job
[BurstCompile]
public partial struct MovementSystemWithJob : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        var job = new MovementJob
        {
            DeltaTime = SystemAPI.Time.DeltaTime
        };
        job.ScheduleParallel();
    }
}

[BurstCompile]
public partial struct MovementJob : IJobEntity
{
    public float DeltaTime;

    void Execute(ref LocalTransform transform, in Velocity velocity)
    {
        transform.Position += velocity.Value * DeltaTime;
    }
}
```

### Entity Creation

```csharp
// Baker (converts GameObject to Entity)
public class EnemyAuthoring : MonoBehaviour
{
    public float speed = 5f;
    public int health = 100;

    class Baker : Baker<EnemyAuthoring>
    {
        public override void Bake(EnemyAuthoring authoring)
        {
            var entity = GetEntity(TransformUsageFlags.Dynamic);

            AddComponent(entity, new Speed { Value = authoring.speed });
            AddComponent(entity, new Health
            {
                Current = authoring.health,
                Max = authoring.health
            });
            AddComponent<EnemyTag>(entity);
        }
    }
}

// Runtime spawning
public partial struct SpawnerSystem : ISystem
{
    public void OnUpdate(ref SystemState state)
    {
        var ecb = new EntityCommandBuffer(Allocator.Temp);

        // Create entity from prefab
        foreach (var (spawner, transform) in
            SystemAPI.Query<RefRW<Spawner>, RefRO<LocalTransform>>())
        {
            if (spawner.ValueRO.Timer <= 0)
            {
                var entity = ecb.Instantiate(spawner.ValueRO.Prefab);
                ecb.SetComponent(entity, new LocalTransform
                {
                    Position = transform.ValueRO.Position,
                    Rotation = quaternion.identity,
                    Scale = 1f
                });

                spawner.ValueRW.Timer = spawner.ValueRO.Interval;
            }
            spawner.ValueRW.Timer -= SystemAPI.Time.DeltaTime;
        }

        ecb.Playback(state.EntityManager);
        ecb.Dispose();
    }
}
```

## Jobs System

### Simple Job

```csharp
using Unity.Jobs;
using Unity.Collections;
using Unity.Burst;

[BurstCompile]
public struct SquareJob : IJob
{
    public NativeArray<float> Numbers;

    public void Execute()
    {
        for (int i = 0; i < Numbers.Length; i++)
        {
            Numbers[i] = Numbers[i] * Numbers[i];
        }
    }
}

// Usage
public class JobExample : MonoBehaviour
{
    void Start()
    {
        var numbers = new NativeArray<float>(1000, Allocator.TempJob);

        // Fill array
        for (int i = 0; i < numbers.Length; i++)
            numbers[i] = i;

        // Schedule job
        var job = new SquareJob { Numbers = numbers };
        JobHandle handle = job.Schedule();

        // Wait for completion
        handle.Complete();

        // Use results
        Debug.Log($"First: {numbers[0]}, Last: {numbers[999]}");

        // Cleanup
        numbers.Dispose();
    }
}
```

### Parallel Job

```csharp
[BurstCompile]
public struct ParallelSquareJob : IJobParallelFor
{
    public NativeArray<float> Numbers;

    public void Execute(int index)
    {
        Numbers[index] = Numbers[index] * Numbers[index];
    }
}

// Usage
var job = new ParallelSquareJob { Numbers = numbers };
JobHandle handle = job.Schedule(numbers.Length, 64);  // 64 = batch size
handle.Complete();
```

### Job Dependencies

```csharp
// Chain jobs
JobHandle handle1 = job1.Schedule();
JobHandle handle2 = job2.Schedule(handle1);  // Waits for job1
handle2.Complete();

// Multiple dependencies
var handles = new NativeArray<JobHandle>(2, Allocator.Temp);
handles[0] = job1.Schedule();
handles[1] = job2.Schedule();
JobHandle combined = JobHandle.CombineDependencies(handles);
job3.Schedule(combined);
```

## Burst Compiler

### Basic Usage

```csharp
using Unity.Burst;

[BurstCompile]
public struct MyJob : IJob
{
    public void Execute()
    {
        // Burst-compiled code
    }
}

// Burst-compiled function
[BurstCompile]
public static class MathUtils
{
    [BurstCompile]
    public static float FastDistance(float3 a, float3 b)
    {
        return math.distance(a, b);
    }
}
```

### Burst Restrictions

**Allowed:**
- Math operations
- NativeContainers
- Unity.Mathematics
- Structs
- Static methods

**Not Allowed:**
- Reference types (class)
- Allocations (new)
- Boxing
- Virtual calls
- Try/catch (limited)

## Native Collections

```csharp
using Unity.Collections;

// Array (fixed size)
var array = new NativeArray<int>(100, Allocator.TempJob);

// List (dynamic)
var list = new NativeList<int>(Allocator.TempJob);
list.Add(1);

// HashMap
var map = new NativeHashMap<int, float>(100, Allocator.TempJob);
map.Add(1, 1.5f);

// Queue
var queue = new NativeQueue<int>(Allocator.TempJob);
queue.Enqueue(1);

// Always dispose!
array.Dispose();
list.Dispose();
map.Dispose();
queue.Dispose();
```

### Allocator Types

| Allocator | Lifetime | Use Case |
|-----------|----------|----------|
| `Temp` | 1 frame | Short operations |
| `TempJob` | 4 frames | Jobs |
| `Persistent` | Manual | Long-lived data |

## Hybrid Approach

### MonoBehaviour + ECS

```csharp
// MonoBehaviour for UI/Input
public class GameManager : MonoBehaviour
{
    private EntityManager _entityManager;
    private Entity _playerEntity;

    void Start()
    {
        _entityManager = World.DefaultGameObjectInjectionWorld.EntityManager;
    }

    void Update()
    {
        // Read ECS data
        if (_entityManager.HasComponent<Health>(_playerEntity))
        {
            var health = _entityManager.GetComponentData<Health>(_playerEntity);
            UpdateHealthUI(health.Current, health.Max);
        }
    }

    public void SpawnEnemy(Vector3 position)
    {
        var entity = _entityManager.CreateEntity();
        _entityManager.AddComponentData(entity, new Position { Value = position });
        _entityManager.AddComponent<EnemyTag>(entity);
    }
}
```

### ECS + Physics

```csharp
// Using Unity.Physics
public struct Projectile : IComponentData
{
    public float Damage;
    public float Lifetime;
}

[BurstCompile]
public partial struct ProjectileSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        var ecb = new EntityCommandBuffer(Allocator.Temp);

        foreach (var (projectile, entity) in
            SystemAPI.Query<RefRW<Projectile>>().WithEntityAccess())
        {
            projectile.ValueRW.Lifetime -= SystemAPI.Time.DeltaTime;

            if (projectile.ValueRO.Lifetime <= 0)
            {
                ecb.DestroyEntity(entity);
            }
        }

        ecb.Playback(state.EntityManager);
        ecb.Dispose();
    }
}
```

## Performance Tips

### DO
- Use `[BurstCompile]` on all jobs and systems
- Use `NativeArray` instead of managed arrays in jobs
- Use `RefRO<T>` for read-only data
- Batch entity operations with `EntityCommandBuffer`

### DON'T
- Access managed objects in Burst code
- Create/destroy entities in parallel jobs
- Use `GetComponent` on entities in hot paths
- Forget to dispose NativeContainers

### Profiling

```csharp
using Unity.Profiling;

static readonly ProfilerMarker s_MyMarker = new("MySystem.Update");

public void OnUpdate(ref SystemState state)
{
    using (s_MyMarker.Auto())
    {
        // Code to profile
    }
}
```

---

*Unity DOTS/ECS - ULTRA-CREATE Gaming Knowledge v23.1*
