# Unity Game Template

> ULTRA-CREATE Template - Jeu 3D avec Unity 6

## Stack

- **Engine**: Unity 6 (6000.0+)
- **Langage**: C# 12
- **Rendering**: URP (Universal Render Pipeline)
- **Multiplayer**: Netcode for GameObjects (optionnel)
- **Input**: New Input System
- **UI**: UI Toolkit

## Prérequis

1. **Unity Hub** avec Unity 6 installé
2. **Visual Studio 2022** ou **Rider** pour C#

## Structure du Projet

```
Assets/
├── Scripts/
│   ├── Core/                    # Systèmes fondamentaux
│   │   ├── GameManager.cs       # Singleton central
│   │   ├── ServiceLocator.cs    # Injection de dépendances
│   │   └── EventBus.cs          # Communication découplée
│   ├── Player/                  # Logique joueur
│   │   ├── PlayerController.cs  # Mouvement et input
│   │   ├── PlayerHealth.cs      # Système de vie
│   │   └── PlayerInventory.cs   # Inventaire
│   ├── UI/                      # Interface utilisateur
│   │   ├── UIManager.cs         # Gestion des écrans
│   │   ├── HUDController.cs     # HUD in-game
│   │   └── MenuController.cs    # Menus
│   ├── Enemies/                 # IA ennemis
│   ├── Items/                   # Objets collectibles
│   └── Utils/                   # Utilitaires
├── Prefabs/                     # GameObjects réutilisables
├── Scenes/                      # Scènes du jeu
│   ├── MainMenu.unity
│   ├── GameScene.unity
│   └── LoadingScene.unity
├── Materials/                   # Matériaux
├── Textures/                    # Textures
├── Audio/                       # Sons et musiques
├── Animations/                  # Animations
└── Settings/                    # Render Pipeline, Input
```

## Scripts Inclus

### Core/GameManager.cs
```csharp
// Singleton pour la gestion globale du jeu
// - États du jeu (Menu, Playing, Paused, GameOver)
// - Score, temps, progression
// - Sauvegarde/Chargement
```

### Player/PlayerController.cs
```csharp
// Contrôle du joueur avec New Input System
// - Mouvement 3D (WASD/Joystick)
// - Camera (Mouse/Stick droit)
// - Actions (Jump, Attack, Interact)
```

### Core/EventBus.cs
```csharp
// Communication événementielle
// - OnPlayerDeath
// - OnScoreChanged
// - OnLevelComplete
// - OnItemCollected
```

## Usage

### 1. Créer un nouveau projet Unity

```
1. Ouvrir Unity Hub
2. New Project → 3D (URP)
3. Copier le contenu de ce template dans Assets/
```

### 2. Configurer les packages

```
Window → Package Manager → Add:
- Input System
- Cinemachine
- TextMeshPro
- (Optionnel) Netcode for GameObjects
```

### 3. Setup Input System

```
Edit → Project Settings → Player → Active Input Handling → Both
```

### 4. Créer la première scène

```csharp
// Dans une scène:
1. Créer un GameObject "GameManager"
2. Attacher GameManager.cs
3. Créer le Player avec PlayerController.cs
4. Configurer la caméra Cinemachine
```

## Patterns Utilisés

### Service Locator
```csharp
// Enregistrer un service
ServiceLocator.Register<IAudioService>(new AudioService());

// Utiliser un service
var audio = ServiceLocator.Get<IAudioService>();
audio.PlaySound("jump");
```

### Event Bus
```csharp
// S'abonner
EventBus.Subscribe<PlayerDeathEvent>(OnPlayerDeath);

// Publier
EventBus.Publish(new PlayerDeathEvent(player));
```

### Object Pooling
```csharp
// Pool de projectiles
var bullet = ObjectPool.Get<Bullet>();
bullet.Fire(direction);
// Retour automatique au pool
```

## Multiplayer (Netcode)

### Setup Réseau
```csharp
// Dans NetworkManager:
1. Add NetworkManager component
2. Configurer Player Prefab avec NetworkObject
3. Ajouter NetworkTransform, NetworkAnimator
```

### Synchronisation
```csharp
// Variables synchronisées
[NetworkVariable]
private NetworkVariable<int> health = new(100);

// RPCs
[ServerRpc]
void TakeDamageServerRpc(int damage) { }

[ClientRpc]
void UpdateHealthClientRpc(int newHealth) { }
```

## Build

```
File → Build Settings:
- PC: Windows/Mac/Linux
- Mobile: Android/iOS
- Console: Xbox/PlayStation/Switch
- WebGL: Pour navigateur
```

## Performance Tips

1. **Object Pooling** pour bullets, ennemis, effets
2. **LOD** pour modèles 3D distants
3. **Occlusion Culling** pour grandes scènes
4. **Baked Lighting** quand possible
5. **Profiler** régulièrement

## Assets Recommandés

| Type | Asset Store |
|------|-------------|
| Characters | Mixamo (gratuit) |
| Environment | Unity Asset Store |
| Audio | Freesound.org |
| UI | Unity UI Samples |

---

*Template ULTRA-CREATE v22.3*
