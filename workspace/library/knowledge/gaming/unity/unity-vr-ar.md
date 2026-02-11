# Unity VR/AR (XR Development)

## Overview

| SDK | Platform | Use Case |
|-----|----------|----------|
| **XR Interaction Toolkit** | All VR/AR | Interactions, UI |
| **OpenXR** | Meta, SteamVR, WMR | VR headsets |
| **AR Foundation** | iOS, Android | Mobile AR |
| **Meta XR SDK** | Meta Quest | Quest-specific |

## Setup

### Packages Required

```
Package Manager:
├── XR Interaction Toolkit
├── XR Plugin Management
├── OpenXR Plugin (VR)
└── AR Foundation + ARCore/ARKit (AR)
```

### Project Settings

```
Edit > Project Settings > XR Plug-in Management:
├── OpenXR (PC VR)
├── Oculus (Quest)
└── ARCore/ARKit (Mobile AR)
```

## XR Rig Setup

### VR Rig

```
XR Origin (XR Rig)
├── Camera Offset
│   ├── Main Camera (Tracked Pose Driver)
│   ├── Left Controller (XR Controller)
│   └── Right Controller (XR Controller)
├── Locomotion System
│   ├── Teleportation Provider
│   └── Snap Turn Provider
└── Interaction Manager
```

### Basic XR Origin Script

```csharp
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;

public class XRRigSetup : MonoBehaviour
{
    [SerializeField] private XROrigin xrOrigin;
    [SerializeField] private ActionBasedController leftController;
    [SerializeField] private ActionBasedController rightController;

    private void Awake()
    {
        // Set tracking origin
        xrOrigin.RequestedTrackingOriginMode =
            XROrigin.TrackingOriginMode.Floor;
    }

    public void RecenterPlayer()
    {
        xrOrigin.MoveCameraToWorldLocation(Vector3.zero);
        xrOrigin.MatchOriginUpCameraForward(Vector3.up, Vector3.forward);
    }
}
```

## Interactions

### Grab Interactable

```csharp
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;

[RequireComponent(typeof(XRGrabInteractable))]
public class GrabbableObject : MonoBehaviour
{
    private XRGrabInteractable _grabInteractable;
    private Rigidbody _rigidbody;

    private void Awake()
    {
        _grabInteractable = GetComponent<XRGrabInteractable>();
        _rigidbody = GetComponent<Rigidbody>();

        // Events
        _grabInteractable.selectEntered.AddListener(OnGrab);
        _grabInteractable.selectExited.AddListener(OnRelease);
        _grabInteractable.activated.AddListener(OnActivate);
    }

    private void OnGrab(SelectEnterEventArgs args)
    {
        Debug.Log($"Grabbed by {args.interactorObject.transform.name}");
    }

    private void OnRelease(SelectExitEventArgs args)
    {
        Debug.Log("Released");
    }

    private void OnActivate(ActivateEventArgs args)
    {
        // Trigger button pressed while holding
        Debug.Log("Activated!");
        PerformAction();
    }

    private void PerformAction()
    {
        // Custom logic when trigger pressed
    }
}
```

### Socket Interactor

```csharp
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;

public class WeaponHolster : MonoBehaviour
{
    [SerializeField] private XRSocketInteractor socket;
    [SerializeField] private AudioSource attachSound;

    private void Awake()
    {
        socket.selectEntered.AddListener(OnObjectAttached);
        socket.selectExited.AddListener(OnObjectRemoved);
    }

    private void OnObjectAttached(SelectEnterEventArgs args)
    {
        attachSound?.Play();
        // Object snapped to holster
    }

    private void OnObjectRemoved(SelectExitEventArgs args)
    {
        // Object taken from holster
    }
}
```

### Poke Interactor (Buttons)

```csharp
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;

public class VRButton : MonoBehaviour
{
    [SerializeField] private XRSimpleInteractable interactable;
    [SerializeField] private UnityEvent onPressed;

    private Vector3 _startPosition;
    private float _pressDepth = 0.02f;

    private void Awake()
    {
        _startPosition = transform.localPosition;
        interactable.selectEntered.AddListener(OnPress);
        interactable.selectExited.AddListener(OnRelease);
    }

    private void OnPress(SelectEnterEventArgs args)
    {
        transform.localPosition = _startPosition - Vector3.forward * _pressDepth;
        onPressed?.Invoke();
    }

    private void OnRelease(SelectExitEventArgs args)
    {
        transform.localPosition = _startPosition;
    }
}
```

## Locomotion

### Teleportation

```csharp
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;

public class TeleportManager : MonoBehaviour
{
    [SerializeField] private TeleportationProvider teleportProvider;
    [SerializeField] private XRRayInteractor leftRay;
    [SerializeField] private XRRayInteractor rightRay;

    // Teleport areas need TeleportationArea or TeleportationAnchor component
    // Ray interactor with Line Visual shows targeting

    public void SetTeleportEnabled(bool enabled)
    {
        leftRay.enabled = enabled;
        rightRay.enabled = enabled;
    }
}
```

### Continuous Move

```csharp
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;

public class ContinuousMovement : MonoBehaviour
{
    [SerializeField] private XROrigin xrOrigin;
    [SerializeField] private InputActionProperty moveInput;
    [SerializeField] private float moveSpeed = 2f;
    [SerializeField] private CharacterController characterController;

    private void Update()
    {
        Vector2 input = moveInput.action.ReadValue<Vector2>();

        if (input != Vector2.zero)
        {
            // Get head direction
            Vector3 headDir = xrOrigin.Camera.transform.forward;
            headDir.y = 0;
            headDir.Normalize();

            Vector3 headRight = xrOrigin.Camera.transform.right;
            headRight.y = 0;
            headRight.Normalize();

            // Calculate movement
            Vector3 move = headDir * input.y + headRight * input.x;
            characterController.Move(move * moveSpeed * Time.deltaTime);
        }

        // Apply gravity
        characterController.Move(Physics.gravity * Time.deltaTime);
    }
}
```

## Hand Tracking

### Basic Hand Tracking

```csharp
using UnityEngine;
using UnityEngine.XR.Hands;

public class HandTracker : MonoBehaviour
{
    private XRHandSubsystem _handSubsystem;

    private void Start()
    {
        // Get hand subsystem
        var subsystems = new List<XRHandSubsystem>();
        SubsystemManager.GetSubsystems(subsystems);

        if (subsystems.Count > 0)
        {
            _handSubsystem = subsystems[0];
            _handSubsystem.updatedHands += OnHandsUpdated;
        }
    }

    private void OnHandsUpdated(XRHandSubsystem subsystem,
        XRHandSubsystem.UpdateSuccessFlags flags,
        XRHandSubsystem.UpdateType updateType)
    {
        // Left hand
        if ((flags & XRHandSubsystem.UpdateSuccessFlags.LeftHandRootPose) != 0)
        {
            var leftHand = subsystem.leftHand;
            ProcessHand(leftHand);
        }

        // Right hand
        if ((flags & XRHandSubsystem.UpdateSuccessFlags.RightHandRootPose) != 0)
        {
            var rightHand = subsystem.rightHand;
            ProcessHand(rightHand);
        }
    }

    private void ProcessHand(XRHand hand)
    {
        // Get specific joint
        if (hand.GetJoint(XRHandJointID.IndexTip).TryGetPose(out Pose indexTip))
        {
            // Use index finger tip position
            Debug.Log($"Index tip: {indexTip.position}");
        }
    }
}
```

### Pinch Detection

```csharp
public class PinchDetector : MonoBehaviour
{
    [SerializeField] private float pinchThreshold = 0.02f;

    public bool IsPinching(XRHand hand)
    {
        if (hand.GetJoint(XRHandJointID.ThumbTip).TryGetPose(out Pose thumb) &&
            hand.GetJoint(XRHandJointID.IndexTip).TryGetPose(out Pose index))
        {
            float distance = Vector3.Distance(thumb.position, index.position);
            return distance < pinchThreshold;
        }
        return false;
    }
}
```

## AR Foundation

### AR Session Setup

```
Scene Hierarchy:
├── AR Session
├── AR Session Origin
│   └── AR Camera
└── AR Managers (on Session Origin)
    ├── AR Plane Manager
    ├── AR Raycast Manager
    └── AR Anchor Manager
```

### Plane Detection

```csharp
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

public class PlaneDetector : MonoBehaviour
{
    [SerializeField] private ARPlaneManager planeManager;
    [SerializeField] private GameObject placementIndicator;

    private void OnEnable()
    {
        planeManager.planesChanged += OnPlanesChanged;
    }

    private void OnDisable()
    {
        planeManager.planesChanged -= OnPlanesChanged;
    }

    private void OnPlanesChanged(ARPlanesChangedEventArgs args)
    {
        foreach (var plane in args.added)
        {
            Debug.Log($"Plane added: {plane.alignment}");
        }

        foreach (var plane in args.updated)
        {
            // Plane size/position changed
        }

        foreach (var plane in args.removed)
        {
            // Plane lost
        }
    }
}
```

### Object Placement

```csharp
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using System.Collections.Generic;

public class ARObjectPlacer : MonoBehaviour
{
    [SerializeField] private ARRaycastManager raycastManager;
    [SerializeField] private GameObject objectPrefab;
    [SerializeField] private GameObject placementIndicator;

    private List<ARRaycastHit> _hits = new();
    private Pose _placementPose;
    private bool _placementValid;

    private void Update()
    {
        UpdatePlacement();

        if (_placementValid && Input.touchCount > 0 &&
            Input.GetTouch(0).phase == TouchPhase.Began)
        {
            PlaceObject();
        }
    }

    private void UpdatePlacement()
    {
        Vector2 screenCenter = new Vector2(Screen.width / 2f, Screen.height / 2f);

        _placementValid = raycastManager.Raycast(
            screenCenter,
            _hits,
            TrackableType.PlaneWithinPolygon
        );

        if (_placementValid)
        {
            _placementPose = _hits[0].pose;
            placementIndicator.SetActive(true);
            placementIndicator.transform.SetPositionAndRotation(
                _placementPose.position,
                _placementPose.rotation
            );
        }
        else
        {
            placementIndicator.SetActive(false);
        }
    }

    private void PlaceObject()
    {
        Instantiate(objectPrefab, _placementPose.position, _placementPose.rotation);
    }
}
```

### Image Tracking

```csharp
using UnityEngine;
using UnityEngine.XR.ARFoundation;

public class ImageTracker : MonoBehaviour
{
    [SerializeField] private ARTrackedImageManager imageManager;
    [SerializeField] private GameObject[] prefabs; // Match reference library order

    private Dictionary<string, GameObject> _spawnedObjects = new();

    private void OnEnable()
    {
        imageManager.trackedImagesChanged += OnTrackedImagesChanged;
    }

    private void OnDisable()
    {
        imageManager.trackedImagesChanged -= OnTrackedImagesChanged;
    }

    private void OnTrackedImagesChanged(ARTrackedImagesChangedEventArgs args)
    {
        foreach (var image in args.added)
        {
            int index = GetPrefabIndex(image.referenceImage.name);
            var spawned = Instantiate(prefabs[index], image.transform);
            _spawnedObjects[image.referenceImage.name] = spawned;
        }

        foreach (var image in args.updated)
        {
            if (_spawnedObjects.TryGetValue(image.referenceImage.name, out var obj))
            {
                obj.SetActive(image.trackingState == TrackingState.Tracking);
            }
        }

        foreach (var image in args.removed)
        {
            if (_spawnedObjects.TryGetValue(image.referenceImage.name, out var obj))
            {
                Destroy(obj);
                _spawnedObjects.Remove(image.referenceImage.name);
            }
        }
    }

    private int GetPrefabIndex(string imageName)
    {
        // Map image name to prefab index
        return 0;
    }
}
```

## VR UI

### World Space Canvas

```csharp
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit.UI;

public class VRUI : MonoBehaviour
{
    [SerializeField] private Canvas worldCanvas;
    [SerializeField] private XRUIInputModule uiInputModule;

    private void Start()
    {
        // Canvas setup
        worldCanvas.renderMode = RenderMode.WorldSpace;
        worldCanvas.worldCamera = Camera.main;

        // Scale for VR (1 unit = 1 meter)
        worldCanvas.transform.localScale = Vector3.one * 0.001f;
    }

    public void AttachToController(Transform controller)
    {
        worldCanvas.transform.SetParent(controller);
        worldCanvas.transform.localPosition = new Vector3(0, 0.1f, 0.1f);
        worldCanvas.transform.localRotation = Quaternion.Euler(45, 0, 0);
    }
}
```

### Curved UI for VR

```csharp
// Use XR UI Input Module with TrackedDeviceGraphicRaycaster
// Add curved mesh or use Unity UI Toolkit with world-space panels
```

## Performance Optimization

### VR Performance

```csharp
public class VRPerformance : MonoBehaviour
{
    private void Start()
    {
        // Target frame rate for VR
        Application.targetFrameRate = 72; // Quest 2
        // or 90 for PC VR

        // Quality settings for VR
        QualitySettings.vSyncCount = 0;
        QualitySettings.antiAliasing = 4;

        // Foveated rendering (if supported)
        // XRSettings.eyeTextureResolutionScale = 1.0f;
    }
}
```

### Fixed Foveated Rendering

```csharp
// For Meta Quest
using Unity.XR.Oculus;

public class FoveatedRendering : MonoBehaviour
{
    private void Start()
    {
        // Enable fixed foveated rendering
        OculusLoader.SetFoveatedRenderingLevel(3);
        OculusLoader.SetDynamicFoveatedRenderingEnabled(true);
    }
}
```

## Best Practices

### VR DO
- Target 72-90 FPS minimum
- Use grab and poke for interactions
- Provide locomotion options
- Use world-space UI
- Implement comfort options (vignette, snap turn)

### VR DON'T
- Move camera without player control
- Use small text or UI elements
- Ignore motion sickness
- Require precise aiming

### AR DO
- Start with plane detection
- Provide visual feedback for tracking
- Handle tracking loss gracefully
- Test on actual devices

### AR DON'T
- Assume perfect tracking
- Place objects too close to camera
- Ignore lighting conditions
- Skip user guidance

---

*Unity VR/AR - ULTRA-CREATE Gaming Knowledge v23.1*
