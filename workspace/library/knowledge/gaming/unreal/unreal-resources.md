# Unreal Engine Resources

> UE5 development resources, plugins, and best practices

---

## Official Resources

| Resource | Description | URL |
|----------|-------------|-----|
| **Documentation** | Official docs | [docs.unrealengine.com](https://docs.unrealengine.com) |
| **Learning Portal** | Free courses | [dev.epicgames.com/community/learning](https://dev.epicgames.com/community/learning) |
| **Marketplace** | Assets & plugins | [unrealengine.com/marketplace](https://www.unrealengine.com/marketplace) |
| **Forums** | Community forums | [forums.unrealengine.com](https://forums.unrealengine.com) |
| **GitHub Samples** | Epic's samples | [github.com/EpicGames](https://github.com/EpicGames) |

---

## UE5 Key Features

### Nanite
Virtualized geometry for film-quality assets.

```cpp
// Enable Nanite on Static Mesh
UStaticMesh* Mesh = ...;
Mesh->NaniteSettings.bEnabled = true;

// In material (Nanite-compatible)
// Use Masked blend mode carefully - prefer Opaque
```

### Lumen
Dynamic global illumination and reflections.

```cpp
// Project Settings > Rendering > Global Illumination
// Set to: Lumen

// In Blueprint - adjust Lumen settings per-actor
StaticMeshComponent->SetLumenSettings(FLumenSettings{
    .bContributeGI = true,
    .EmissiveBoost = 1.0f
});
```

### Virtual Shadow Maps
High-resolution shadows for large worlds.

```cpp
// Project Settings > Rendering > Shadows
// Enable: Virtual Shadow Maps

// Per-light settings
DirectionalLight->bUseVirtualShadowMaps = true;
DirectionalLight->VirtualShadowMapResolution = 4096;
```

### World Partition
Large world streaming and level management.

```cpp
// Enable in World Settings
UWorld::SetWorldPartition(true);

// Create Data Layers for streaming
UDataLayerAsset* Layer = NewObject<UDataLayerAsset>();
Layer->SetLayerName("Gameplay");
```

---

## Essential Plugins

### Core Functionality

| Plugin | Purpose | Source |
|--------|---------|--------|
| **Enhanced Input** | Modern input system | Built-in |
| **Gameplay Abilities** | RPG-style abilities | Built-in |
| **Common UI** | Cross-platform UI | Built-in |
| **Online Subsystem** | Multiplayer networking | Built-in |
| **Niagara** | VFX system | Built-in |

### Third-Party (Recommended)

| Plugin | Purpose | URL |
|--------|---------|-----|
| **Mass Entity** | Large-scale ECS | [Marketplace](https://www.unrealengine.com/marketplace) |
| **Voxel Plugin** | Voxel terrain | [GitHub](https://github.com/Phyronnaz/VoxelPlugin) |
| **Runtime Mesh** | Procedural meshes | [GitHub](https://github.com/TriAxis-Games/RuntimeMeshComponent) |
| **Recast Detour** | AI navigation | Built-in |

---

## Code Patterns

### Enhanced Input

```cpp
// Input Action
UPROPERTY(EditAnywhere)
UInputAction* IA_Move;

void AMyCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    UEnhancedInputComponent* EnhancedInput = Cast<UEnhancedInputComponent>(PlayerInputComponent);

    EnhancedInput->BindAction(IA_Move, ETriggerEvent::Triggered, this, &AMyCharacter::Move);
}

void AMyCharacter::Move(const FInputActionValue& Value)
{
    FVector2D MovementVector = Value.Get<FVector2D>();
    AddMovementInput(GetActorForwardVector(), MovementVector.Y);
    AddMovementInput(GetActorRightVector(), MovementVector.X);
}
```

### Gameplay Ability System

```cpp
// Ability Tag Container
UPROPERTY(EditAnywhere, Category = "Abilities")
FGameplayTagContainer AbilityTags;

// Grant ability
AbilitySystemComponent->GiveAbility(FGameplayAbilitySpec(MyAbilityClass, 1));

// Activate by tag
FGameplayTagContainer TagContainer;
TagContainer.AddTag(FGameplayTag::RequestGameplayTag("Ability.Skill.Fireball"));
AbilitySystemComponent->TryActivateAbilitiesByTag(TagContainer);
```

### Subsystem Pattern

```cpp
// Game Instance Subsystem (persistent)
UCLASS()
class UMyGameSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    UFUNCTION(BlueprintCallable)
    void DoSomething();
};

// Access from anywhere
UMyGameSubsystem* Subsystem = GetGameInstance()->GetSubsystem<UMyGameSubsystem>();
```

---

## Performance Guidelines

### Nanite Best Practices
- Use for static geometry only
- Minimum 1000+ triangles to benefit
- Avoid masked materials when possible
- Enable "Allow CPU Access" for physics meshes

### Lumen Optimization
- Use Lumen Scene Detail for quality/perf balance
- Limit emissive surfaces (costly for GI)
- Use Screen Traces for reflections when possible
- Consider Hardware Ray Tracing for high-end

### Memory Management
```cpp
// Async loading
FStreamableManager& Manager = UAssetManager::GetStreamableManager();
Manager.RequestAsyncLoad(AssetPath, FStreamableDelegate::CreateLambda([]() {
    // Asset loaded
}));

// Soft object pointers (don't force load)
UPROPERTY(EditAnywhere)
TSoftObjectPtr<UStaticMesh> MeshAsset;

// Load when needed
UStaticMesh* Mesh = MeshAsset.LoadSynchronous();
```

---

## Networking

### Replication

```cpp
UPROPERTY(Replicated)
float Health;

UPROPERTY(ReplicatedUsing = OnRep_Ammo)
int32 Ammo;

void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    DOREPLIFETIME(AMyCharacter, Health);
    DOREPLIFETIME_CONDITION(AMyCharacter, Ammo, COND_OwnerOnly);
}

UFUNCTION()
void OnRep_Ammo()
{
    UpdateAmmoUI();
}
```

### RPCs

```cpp
// Server RPC
UFUNCTION(Server, Reliable)
void Server_Fire(FVector Direction);

// Client RPC
UFUNCTION(Client, Reliable)
void Client_ShowDamage(float Amount);

// Multicast
UFUNCTION(NetMulticast, Unreliable)
void Multicast_PlayEffect(FVector Location);
```

---

## Build & Packaging

### Cooking Settings
```ini
; DefaultEngine.ini
[/Script/UnrealEd.ProjectPackagingSettings]
BuildConfiguration=Shipping
BlueprintNativizationMethod=Disabled
bShareMaterialShaderCode=True
bDeterministicShaderCodeOrder=True
```

### Command Line
```bash
# Build and cook
RunUAT.bat BuildCookRun -project=MyProject.uproject -platform=Win64 -clientconfig=Shipping -cook -stage -pak -archive

# Dedicated server
RunUAT.bat BuildCookRun -project=MyProject.uproject -platform=Win64 -server -serverconfig=Shipping -cook
```

---

## Learning Path

### Beginner
1. Blueprint Visual Scripting
2. Level Design Basics
3. Material Editor
4. Animation Blueprints

### Intermediate
1. C++ Gameplay Framework
2. Enhanced Input System
3. Niagara VFX
4. UI with CommonUI

### Advanced
1. Gameplay Ability System
2. Mass Entity (ECS)
3. Custom Shaders (HLSL)
4. Engine Modification

---

## Community Resources

| Resource | Description |
|----------|-------------|
| [Unreal Slackers](https://discord.gg/unreal-slackers) | Discord community |
| [Ben Cloward](https://www.youtube.com/@BenCloward) | Shader tutorials |
| [Mathew Wadstein](https://www.youtube.com/@MathewWadsteinTutorials) | WTF tutorials |
| [Tom Looman](https://www.tomlooman.com/) | C++ tutorials |
| [Alex Forsythe](https://www.youtube.com/@AlexForsythe) | Engine deep-dives |

---

*ULTRA-CREATE Gaming Knowledge v24.1*
