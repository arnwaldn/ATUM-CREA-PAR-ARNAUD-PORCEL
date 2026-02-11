# Unity Multiplayer (Netcode for GameObjects)

## Overview

Netcode for GameObjects (NGO) = Unity's official networking solution.

| Concept | Description |
|---------|-------------|
| **Server** | Authority, validates actions |
| **Client** | Sends requests, receives state |
| **Host** | Server + Client combined |
| **NetworkObject** | Synced across network |
| **NetworkBehaviour** | Scripts on NetworkObjects |

## Setup

```
Package Manager > Netcode for GameObjects
```

### Network Manager

```csharp
// Create empty GameObject with NetworkManager component
// Configure in Inspector:
// - Player Prefab (with NetworkObject)
// - Network Transport (Unity Transport)
```

## Network Objects

### Basic NetworkBehaviour

```csharp
using Unity.Netcode;

public class Player : NetworkBehaviour
{
    // Synced variable (server authoritative)
    private NetworkVariable<int> _health = new(
        100,
        NetworkVariableReadPermission.Everyone,
        NetworkVariableWritePermission.Server
    );

    public override void OnNetworkSpawn()
    {
        if (IsOwner)
        {
            // Local player setup
            EnableInput();
        }

        _health.OnValueChanged += OnHealthChanged;
    }

    public override void OnNetworkDespawn()
    {
        _health.OnValueChanged -= OnHealthChanged;
    }

    private void OnHealthChanged(int oldValue, int newValue)
    {
        UpdateHealthUI(newValue);
    }
}
```

### Network Variables

```csharp
// Different permission combinations
public NetworkVariable<int> serverOwned = new(
    0,
    NetworkVariableReadPermission.Everyone,
    NetworkVariableWritePermission.Server
);

public NetworkVariable<Vector3> ownerWritable = new(
    Vector3.zero,
    NetworkVariableReadPermission.Everyone,
    NetworkVariableWritePermission.Owner
);

// Custom serializable struct
public struct PlayerState : INetworkSerializable
{
    public int Health;
    public int Ammo;
    public Vector3 Position;

    public void NetworkSerialize<T>(BufferSerializer<T> serializer) where T : IReaderWriter
    {
        serializer.SerializeValue(ref Health);
        serializer.SerializeValue(ref Ammo);
        serializer.SerializeValue(ref Position);
    }
}

public NetworkVariable<PlayerState> playerState = new();
```

## RPCs (Remote Procedure Calls)

### Server RPC (Client → Server)

```csharp
public class PlayerController : NetworkBehaviour
{
    private void Update()
    {
        if (!IsOwner) return;

        if (Input.GetKeyDown(KeyCode.Space))
        {
            // Client requests jump
            JumpServerRpc();
        }
    }

    [ServerRpc]
    private void JumpServerRpc()
    {
        // Server validates and executes
        if (CanJump())
        {
            PerformJump();
            // Notify all clients
            JumpClientRpc();
        }
    }
}
```

### Client RPC (Server → Clients)

```csharp
[ClientRpc]
private void JumpClientRpc()
{
    // Executed on all clients
    PlayJumpAnimation();
    PlayJumpSound();
}

// Target specific client
[ClientRpc]
private void NotifyPlayerClientRpc(string message, ClientRpcParams clientRpcParams = default)
{
    ShowNotification(message);
}

// Usage
private void NotifySpecificClient(ulong clientId, string message)
{
    var clientRpcParams = new ClientRpcParams
    {
        Send = new ClientRpcSendParams
        {
            TargetClientIds = new[] { clientId }
        }
    };
    NotifyPlayerClientRpc(message, clientRpcParams);
}
```

## Object Spawning

### Spawn from Server

```csharp
public class Spawner : NetworkBehaviour
{
    [SerializeField] private GameObject enemyPrefab;

    public void SpawnEnemy(Vector3 position)
    {
        if (!IsServer) return;

        var enemy = Instantiate(enemyPrefab, position, Quaternion.identity);
        enemy.GetComponent<NetworkObject>().Spawn();
    }

    public void SpawnWithOwnership(Vector3 position, ulong clientId)
    {
        if (!IsServer) return;

        var obj = Instantiate(enemyPrefab, position, Quaternion.identity);
        obj.GetComponent<NetworkObject>().SpawnWithOwnership(clientId);
    }

    public void DespawnEnemy(NetworkObject enemy)
    {
        if (!IsServer) return;

        enemy.Despawn();
        // Or destroy: enemy.Despawn(true);
    }
}
```

### Object Pooling

```csharp
public class NetworkObjectPool : MonoBehaviour
{
    public static NetworkObjectPool Instance;

    [SerializeField] private GameObject prefab;
    [SerializeField] private int poolSize = 20;

    private Queue<NetworkObject> _pool = new();

    private void Awake()
    {
        Instance = this;
        InitializePool();
    }

    private void InitializePool()
    {
        for (int i = 0; i < poolSize; i++)
        {
            var obj = Instantiate(prefab);
            obj.SetActive(false);
            _pool.Enqueue(obj.GetComponent<NetworkObject>());
        }
    }

    public NetworkObject Get(Vector3 position)
    {
        var obj = _pool.Count > 0 ? _pool.Dequeue() : CreateNew();
        obj.transform.position = position;
        obj.gameObject.SetActive(true);
        return obj;
    }

    public void Return(NetworkObject obj)
    {
        obj.gameObject.SetActive(false);
        _pool.Enqueue(obj);
    }
}
```

## Client-Side Prediction

### Movement with Prediction

```csharp
public class PredictedMovement : NetworkBehaviour
{
    [SerializeField] private float moveSpeed = 5f;

    private NetworkVariable<Vector3> _serverPosition = new();
    private Vector3 _predictedPosition;
    private Queue<MoveInput> _pendingInputs = new();

    private struct MoveInput
    {
        public uint Tick;
        public Vector2 Direction;
    }

    private void Update()
    {
        if (!IsOwner) return;

        // Capture input
        var input = new Vector2(
            Input.GetAxis("Horizontal"),
            Input.GetAxis("Vertical")
        );

        // Local prediction
        _predictedPosition += new Vector3(input.x, 0, input.y) * moveSpeed * Time.deltaTime;
        transform.position = _predictedPosition;

        // Send to server
        SendMovementServerRpc(input, NetworkManager.LocalTime.Tick);
    }

    [ServerRpc]
    private void SendMovementServerRpc(Vector2 input, uint tick)
    {
        // Server authoritative movement
        var movement = new Vector3(input.x, 0, input.y) * moveSpeed * Time.fixedDeltaTime;
        _serverPosition.Value += movement;

        // Confirm to client
        ConfirmMovementClientRpc(tick, _serverPosition.Value);
    }

    [ClientRpc]
    private void ConfirmMovementClientRpc(uint tick, Vector3 serverPos)
    {
        if (!IsOwner) return;

        // Reconcile if needed
        float error = Vector3.Distance(_predictedPosition, serverPos);
        if (error > 0.1f)
        {
            _predictedPosition = serverPos;
            transform.position = serverPos;
        }
    }
}
```

## Lobby & Matchmaking

### Simple Lobby

```csharp
using Unity.Netcode;

public class LobbyManager : NetworkBehaviour
{
    public NetworkList<PlayerData> Players;

    public struct PlayerData : INetworkSerializable, IEquatable<PlayerData>
    {
        public ulong ClientId;
        public FixedString32Bytes Name;
        public bool IsReady;

        public void NetworkSerialize<T>(BufferSerializer<T> serializer) where T : IReaderWriter
        {
            serializer.SerializeValue(ref ClientId);
            serializer.SerializeValue(ref Name);
            serializer.SerializeValue(ref IsReady);
        }

        public bool Equals(PlayerData other) => ClientId == other.ClientId;
    }

    private void Awake()
    {
        Players = new NetworkList<PlayerData>();
    }

    public override void OnNetworkSpawn()
    {
        if (IsServer)
        {
            NetworkManager.OnClientConnectedCallback += OnClientConnected;
            NetworkManager.OnClientDisconnectCallback += OnClientDisconnected;
        }

        Players.OnListChanged += OnPlayersChanged;
    }

    private void OnClientConnected(ulong clientId)
    {
        Players.Add(new PlayerData
        {
            ClientId = clientId,
            Name = $"Player_{clientId}",
            IsReady = false
        });
    }

    private void OnClientDisconnected(ulong clientId)
    {
        for (int i = 0; i < Players.Count; i++)
        {
            if (Players[i].ClientId == clientId)
            {
                Players.RemoveAt(i);
                break;
            }
        }
    }

    [ServerRpc(RequireOwnership = false)]
    public void SetReadyServerRpc(bool ready, ServerRpcParams rpcParams = default)
    {
        var clientId = rpcParams.Receive.SenderClientId;

        for (int i = 0; i < Players.Count; i++)
        {
            if (Players[i].ClientId == clientId)
            {
                var player = Players[i];
                player.IsReady = ready;
                Players[i] = player;
                break;
            }
        }

        // Check if all ready
        if (AllPlayersReady())
        {
            StartGame();
        }
    }

    private bool AllPlayersReady()
    {
        foreach (var player in Players)
        {
            if (!player.IsReady) return false;
        }
        return Players.Count >= 2;
    }

    private void StartGame()
    {
        // Load game scene
        NetworkManager.SceneManager.LoadScene("GameScene", LoadSceneMode.Single);
    }
}
```

### Connection UI

```csharp
public class ConnectionUI : MonoBehaviour
{
    [SerializeField] private TMP_InputField addressInput;
    [SerializeField] private TMP_InputField portInput;

    public void StartHost()
    {
        NetworkManager.Singleton.StartHost();
    }

    public void StartClient()
    {
        var transport = NetworkManager.Singleton.GetComponent<UnityTransport>();
        transport.ConnectionData.Address = addressInput.text;
        transport.ConnectionData.Port = ushort.Parse(portInput.text);

        NetworkManager.Singleton.StartClient();
    }

    public void StartServer()
    {
        NetworkManager.Singleton.StartServer();
    }

    public void Disconnect()
    {
        NetworkManager.Singleton.Shutdown();
    }
}
```

## Synchronization Patterns

### Tick-Based Sync

```csharp
public class TickSyncManager : NetworkBehaviour
{
    public const int TickRate = 60;
    public static uint CurrentTick { get; private set; }

    private float _tickTimer;
    private const float TickInterval = 1f / TickRate;

    private void Update()
    {
        if (!IsServer) return;

        _tickTimer += Time.deltaTime;

        while (_tickTimer >= TickInterval)
        {
            CurrentTick++;
            _tickTimer -= TickInterval;

            // Process tick
            OnServerTick();
        }
    }

    private void OnServerTick()
    {
        // Process all player inputs for this tick
        // Apply game logic
        // Send state updates
    }
}
```

### State Interpolation

```csharp
public class InterpolatedTransform : NetworkBehaviour
{
    private NetworkVariable<Vector3> _networkPosition = new();
    private NetworkVariable<Quaternion> _networkRotation = new();

    [SerializeField] private float interpolationSpeed = 10f;

    private void Update()
    {
        if (IsOwner) return;

        // Smooth interpolation for remote players
        transform.position = Vector3.Lerp(
            transform.position,
            _networkPosition.Value,
            Time.deltaTime * interpolationSpeed
        );

        transform.rotation = Quaternion.Slerp(
            transform.rotation,
            _networkRotation.Value,
            Time.deltaTime * interpolationSpeed
        );
    }

    private void FixedUpdate()
    {
        if (!IsOwner || !IsSpawned) return;

        // Owner updates network variables
        if (IsServer)
        {
            _networkPosition.Value = transform.position;
            _networkRotation.Value = transform.rotation;
        }
        else
        {
            UpdatePositionServerRpc(transform.position, transform.rotation);
        }
    }

    [ServerRpc]
    private void UpdatePositionServerRpc(Vector3 position, Quaternion rotation)
    {
        _networkPosition.Value = position;
        _networkRotation.Value = rotation;
    }
}
```

## Best Practices

### DO
- Validate all client inputs on server
- Use NetworkVariables for state, RPCs for events
- Implement client-side prediction for responsive gameplay
- Pool NetworkObjects for frequent spawning

### DON'T
- Trust client data without validation
- Send more data than necessary
- Spawn/despawn frequently without pooling
- Ignore latency in game design

### Security

```csharp
[ServerRpc]
private void TakeDamageServerRpc(int damage, ServerRpcParams rpcParams = default)
{
    // ALWAYS validate on server
    var senderId = rpcParams.Receive.SenderClientId;

    // Check if sender can deal damage
    if (!CanDealDamage(senderId))
        return;

    // Validate damage amount
    damage = Mathf.Clamp(damage, 0, MaxDamagePerHit);

    // Apply
    _health.Value -= damage;
}
```

---

*Unity Multiplayer - ULTRA-CREATE Gaming Knowledge v23.1*
