# Unity New Input System

## Setup

```
Package Manager > Input System
Edit > Project Settings > Player > Active Input Handling: "Input System Package (New)"
```

## Input Actions Asset

### Create Asset
`Right Click > Create > Input Actions`

### Structure

```
PlayerControls (Input Action Asset)
├── Player (Action Map)
│   ├── Move (Action) - Value/Vector2
│   ├── Jump (Action) - Button
│   ├── Attack (Action) - Button
│   └── Look (Action) - Value/Vector2
├── UI (Action Map)
│   ├── Navigate (Action)
│   ├── Submit (Action)
│   └── Cancel (Action)
└── Vehicle (Action Map)
    ├── Accelerate (Action)
    └── Steer (Action)
```

## Reading Input

### Generated C# Class

Enable "Generate C# Class" in Input Actions asset.

```csharp
public class PlayerController : MonoBehaviour
{
    private PlayerControls _controls;
    private Vector2 _moveInput;

    private void Awake()
    {
        _controls = new PlayerControls();
    }

    private void OnEnable()
    {
        _controls.Enable();
        _controls.Player.Move.performed += OnMove;
        _controls.Player.Move.canceled += OnMove;
        _controls.Player.Jump.performed += OnJump;
    }

    private void OnDisable()
    {
        _controls.Player.Move.performed -= OnMove;
        _controls.Player.Move.canceled -= OnMove;
        _controls.Player.Jump.performed -= OnJump;
        _controls.Disable();
    }

    private void OnMove(InputAction.CallbackContext ctx)
    {
        _moveInput = ctx.ReadValue<Vector2>();
    }

    private void OnJump(InputAction.CallbackContext ctx)
    {
        Jump();
    }

    private void Update()
    {
        transform.Translate(new Vector3(_moveInput.x, 0, _moveInput.y) * Time.deltaTime * 5f);
    }
}
```

### PlayerInput Component

```csharp
// Simpler approach using PlayerInput component
public class PlayerController : MonoBehaviour
{
    private Vector2 _moveInput;

    // Called via PlayerInput component (Unity Events)
    public void OnMove(InputValue value)
    {
        _moveInput = value.Get<Vector2>();
    }

    public void OnJump(InputValue value)
    {
        if (value.isPressed)
            Jump();
    }

    public void OnAttack(InputValue value)
    {
        Attack();
    }
}
```

### Direct Reading

```csharp
public class SimpleInput : MonoBehaviour
{
    [SerializeField] private InputActionReference moveAction;
    [SerializeField] private InputActionReference jumpAction;

    private void OnEnable()
    {
        moveAction.action.Enable();
        jumpAction.action.Enable();
    }

    private void OnDisable()
    {
        moveAction.action.Disable();
        jumpAction.action.Disable();
    }

    private void Update()
    {
        Vector2 move = moveAction.action.ReadValue<Vector2>();
        bool jumped = jumpAction.action.WasPressedThisFrame();
    }
}
```

## Action Types

### Button

```csharp
// Trigger types
action.triggered;                    // True on press
action.WasPressedThisFrame();       // True on frame of press
action.WasReleasedThisFrame();      // True on frame of release
action.IsPressed();                 // True while held
```

### Value

```csharp
// Read values
Vector2 move = moveAction.ReadValue<Vector2>();
float trigger = triggerAction.ReadValue<float>();
```

### Pass Through

```csharp
// All input goes through, no processing
// Good for: mouse delta, raw values
```

## Control Schemes

### Define Schemes

```
Control Schemes:
├── Keyboard&Mouse
│   ├── Keyboard
│   └── Mouse
├── Gamepad
│   └── Gamepad
└── Touch
    └── Touchscreen
```

### Switch Schemes

```csharp
public class InputManager : MonoBehaviour
{
    [SerializeField] private PlayerInput playerInput;

    public void SwitchToGamepad()
    {
        playerInput.SwitchCurrentControlScheme("Gamepad", Gamepad.current);
    }

    public void SwitchToKeyboard()
    {
        playerInput.SwitchCurrentControlScheme("Keyboard&Mouse",
            Keyboard.current, Mouse.current);
    }

    // Detect scheme change
    private void OnEnable()
    {
        playerInput.onControlsChanged += OnControlsChanged;
    }

    private void OnControlsChanged(PlayerInput input)
    {
        string scheme = input.currentControlScheme;
        UpdateUIPrompts(scheme);
    }
}
```

## Rebinding

### Runtime Rebinding

```csharp
public class RebindingUI : MonoBehaviour
{
    [SerializeField] private InputActionReference actionToRebind;
    [SerializeField] private TextMeshProUGUI bindingText;
    [SerializeField] private GameObject waitingUI;

    private InputActionRebindingExtensions.RebindingOperation _rebindOperation;

    public void StartRebinding()
    {
        actionToRebind.action.Disable();
        waitingUI.SetActive(true);

        _rebindOperation = actionToRebind.action.PerformInteractiveRebinding()
            .WithControlsExcluding("Mouse")
            .OnMatchWaitForAnother(0.1f)
            .OnComplete(operation => RebindComplete())
            .OnCancel(operation => RebindCancelled())
            .Start();
    }

    private void RebindComplete()
    {
        _rebindOperation.Dispose();
        actionToRebind.action.Enable();
        waitingUI.SetActive(false);
        UpdateBindingDisplay();
    }

    private void RebindCancelled()
    {
        _rebindOperation.Dispose();
        actionToRebind.action.Enable();
        waitingUI.SetActive(false);
    }

    private void UpdateBindingDisplay()
    {
        int bindingIndex = actionToRebind.action.GetBindingIndexForControl(
            actionToRebind.action.controls[0]);

        bindingText.text = InputControlPath.ToHumanReadableString(
            actionToRebind.action.bindings[bindingIndex].effectivePath,
            InputControlPath.HumanReadableStringOptions.OmitDevice);
    }
}
```

### Save/Load Bindings

```csharp
public class BindingSaveLoad : MonoBehaviour
{
    [SerializeField] private InputActionAsset inputActions;

    private const string BindingsKey = "InputBindings";

    public void SaveBindings()
    {
        var rebinds = inputActions.SaveBindingOverridesAsJson();
        PlayerPrefs.SetString(BindingsKey, rebinds);
    }

    public void LoadBindings()
    {
        var rebinds = PlayerPrefs.GetString(BindingsKey, string.Empty);
        if (!string.IsNullOrEmpty(rebinds))
        {
            inputActions.LoadBindingOverridesFromJson(rebinds);
        }
    }

    public void ResetToDefaults()
    {
        inputActions.RemoveAllBindingOverrides();
        PlayerPrefs.DeleteKey(BindingsKey);
    }
}
```

## Composite Bindings

### WASD + Arrow Keys

```
Move Action (Vector2):
├── 2D Vector Composite "WASD"
│   ├── Up: W
│   ├── Down: S
│   ├── Left: A
│   └── Right: D
├── 2D Vector Composite "Arrows"
│   ├── Up: UpArrow
│   ├── Down: DownArrow
│   ├── Left: LeftArrow
│   └── Right: RightArrow
└── Gamepad: Left Stick
```

### One Modifier

```
Sprint Action:
├── One Modifier Composite
│   ├── Modifier: Left Shift
│   └── Binding: W
```

## Multiplayer Input

### Split-Screen

```csharp
public class MultiplayerManager : MonoBehaviour
{
    [SerializeField] private GameObject playerPrefab;

    public void OnPlayerJoined(PlayerInput playerInput)
    {
        int playerIndex = playerInput.playerIndex;
        Debug.Log($"Player {playerIndex} joined with {playerInput.currentControlScheme}");

        // Setup camera for split-screen
        var camera = playerInput.camera;
        camera.rect = GetViewportRect(playerIndex);
    }

    public void OnPlayerLeft(PlayerInput playerInput)
    {
        Debug.Log($"Player {playerInput.playerIndex} left");
    }

    private Rect GetViewportRect(int index)
    {
        return index switch
        {
            0 => new Rect(0, 0.5f, 0.5f, 0.5f),      // Top-left
            1 => new Rect(0.5f, 0.5f, 0.5f, 0.5f),  // Top-right
            2 => new Rect(0, 0, 0.5f, 0.5f),         // Bottom-left
            3 => new Rect(0.5f, 0, 0.5f, 0.5f),     // Bottom-right
            _ => new Rect(0, 0, 1, 1)
        };
    }
}
```

## Touch Input

### Touch Actions

```
TouchControls (Action Map):
├── PrimaryTouch (Action)
│   ├── Position: Touchscreen/touch0/position
│   └── Press: Touchscreen/touch0/press
├── SecondaryTouch (Action)
│   └── Position: Touchscreen/touch1/position
└── PinchDelta (Custom)
```

### Virtual Joystick

```csharp
public class VirtualJoystick : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
{
    [SerializeField] private RectTransform background;
    [SerializeField] private RectTransform handle;
    [SerializeField] private float handleRange = 50f;

    private Vector2 _inputVector;
    public Vector2 InputVector => _inputVector;

    public void OnPointerDown(PointerEventData eventData)
    {
        OnDrag(eventData);
    }

    public void OnDrag(PointerEventData eventData)
    {
        Vector2 position;
        RectTransformUtility.ScreenPointToLocalPointInRectangle(
            background, eventData.position, eventData.pressEventCamera, out position);

        position = Vector2.ClampMagnitude(position, handleRange);
        handle.anchoredPosition = position;
        _inputVector = position / handleRange;
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        _inputVector = Vector2.zero;
        handle.anchoredPosition = Vector2.zero;
    }
}
```

## Best Practices

### Action Map Switching

```csharp
public class GameStateManager : MonoBehaviour
{
    [SerializeField] private PlayerInput playerInput;

    public void EnterGameplay()
    {
        playerInput.SwitchCurrentActionMap("Player");
    }

    public void EnterUI()
    {
        playerInput.SwitchCurrentActionMap("UI");
    }

    public void EnterVehicle()
    {
        playerInput.SwitchCurrentActionMap("Vehicle");
    }
}
```

### Input Buffer

```csharp
public class InputBuffer : MonoBehaviour
{
    private float _jumpBufferTime = 0.1f;
    private float _jumpBufferCounter;

    private void Update()
    {
        if (Keyboard.current.spaceKey.wasPressedThisFrame)
        {
            _jumpBufferCounter = _jumpBufferTime;
        }

        _jumpBufferCounter -= Time.deltaTime;
    }

    public bool ConsumeJump()
    {
        if (_jumpBufferCounter > 0)
        {
            _jumpBufferCounter = 0;
            return true;
        }
        return false;
    }
}
```

---

*Unity Input System - ULTRA-CREATE Gaming Knowledge v23.1*
