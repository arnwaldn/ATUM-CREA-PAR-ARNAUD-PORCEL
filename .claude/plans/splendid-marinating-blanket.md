# Plan : Activer le Mode Sombre sur tout le PC

## Contexte
Le systeme Windows est actuellement en mode clair (`AppsUseLightTheme=1`, `SystemUsesLightTheme=1`). L'utilisateur veut passer tout son PC en mode sombre.

## Actions

### 1. Windows System Dark Mode (registre)
- `HKCU\...\Personalize\SystemUsesLightTheme` = **0** (barre des taches, menu demarrer, centre de notifications)
- `HKCU\...\Personalize\AppsUseLightTheme` = **0** (toutes les apps UWP/Win32 compatibles)

### 2. Navigateurs
- **Edge / Chrome / Firefox** : suivent automatiquement le theme systeme Windows une fois `AppsUseLightTheme=0`
- Aucune action supplementaire necessaire

### 3. Autres apps
- La majorite des apps modernes (VS Code, Discord, Spotify, etc.) respectent le theme systeme ou ont deja leur propre dark mode
- Les apps Electron (comme ATUM CREA) suivent aussi `nativeTheme.shouldUseDarkColors`

## Commandes a executer

```powershell
# Apps en mode sombre
Set-ItemProperty -Path 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize' -Name 'AppsUseLightTheme' -Value 0

# Systeme (taskbar, start menu) en mode sombre
Set-ItemProperty -Path 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize' -Name 'SystemUsesLightTheme' -Value 0
```

## Verification
- Verifier que les 2 valeurs de registre sont a 0
- Le changement est instantane, pas besoin de redemarrer
