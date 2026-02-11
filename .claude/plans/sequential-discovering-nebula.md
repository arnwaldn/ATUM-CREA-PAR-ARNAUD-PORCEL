# Plan de correction : ATUM CREA - Problemes post-rebranding

## Contexte

Durant le rebranding de "Hello Halo" vers "ATUM CREA", le script `dev` dans `package.json` a ete modifie :
- `HALO_DATA_DIR=~/.halo-dev` → `ATUM_DATA_DIR=~/.atum-dev`

Cela a cree un **nouveau repertoire de donnees** (`~/.atum-dev/`) avec un config quasi-vide, au lieu d'utiliser `~/.halo-dev/` qui contient toutes les vraies donnees de l'utilisateur (43 MCPs, cles API, sources OpenAI, etc.)

### Impact
| Probleme | Cause | Severite |
|----------|-------|----------|
| MCPs manquants (13 au lieu de 43) | `~/.atum-dev/config.json` = config template, pas les vrais MCPs | CRITIQUE |
| Micro/dictee vocale en erreur | Pas de source OpenAI dans `~/.atum-dev/` → Whisper API echoue | CRITIQUE |
| Team Agent | Fonctionne (active par defaut), fausse alerte | OK |

## Correction

### Etape 1 : Corriger package.json (1 ligne)

**Fichier** : `C:\Users\arnau\Desktop\ATUM CREA\hello-halo\package.json`

Changer la ligne du script `dev` :
```
AVANT : "dev": "cross-env ATUM_DATA_DIR=~/.atum-dev electron-vite dev"
APRES : "dev": "electron-vite dev"
```

**Pourquoi supprimer l'env var plutot que la corriger ?**
- `getAtumCreDir()` dans `config.service.ts:378-400` a deja la logique correcte :
  - Si `!app.isPackaged` (dev mode) → retourne `~/.halo-dev` automatiquement
  - En production → retourne `~/.halo`
- L'env var `ATUM_DATA_DIR` est gardee comme override optionnel (tests E2E, debug)
- Pas besoin de la forcer dans le script dev normal

### Etape 2 : Verifier que `~/.atum-dev/` n'interfere pas

Le repertoire `~/.atum-dev/` existant ne pose pas de probleme :
- Il ne sera plus lu par l'app (l'env var n'est plus definie)
- On peut le laisser ou le supprimer (optionnel, on demande a l'utilisateur)

### Etape 3 : Verifier l'absence de references `~/.atum-dev` restantes

Verifier qu'aucun autre fichier ne reference `~/.atum-dev` dans le code source.

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `package.json` (ligne 10) | Supprimer `cross-env ATUM_DATA_DIR=~/.atum-dev` du script dev |
| `.vscode/launch.json` (ligne 12) | Supprimer ou corriger `ATUM_DATA_DIR: "~/.atum-dev"` |

## Fichiers de reference (lecture seule)

| Fichier | Role |
|---------|------|
| `src/main/services/config.service.ts:378-400` | `getAtumCreDir()` - logique fallback correcte |
| `~/.halo-dev/config.json` | Config reelle (43 MCPs, 2 sources AI) |
| `~/.atum-dev/config.json` | Config erronee (13 MCPs templates, 1 source) |

## Verification

1. **Build** : `npm run build` (doit passer sans erreur - deja verifie)
2. **Lancer l'app** : `npm run dev` via la bat file
3. **Verifier MCPs** : Ouvrir Settings → Section MCP → doit afficher 43+ serveurs avec categories
4. **Verifier micro** : Cliquer sur le bouton Mic dans la zone de saisie → doit enregistrer puis transcrire (Whisper via OpenAI)
5. **Verifier Team Agent** : Settings → System → toggle "Agent Teams" present et actif
6. **Verifier logs** : Console doit afficher `[Agent] Using headless Electron` et `[Hindsight] Native memory engine initialized`

## Securite (note)

Les fichiers `~/.halo-dev/config.json` et `~/.atum-dev/config.json` contiennent des cles API en clair (GitHub PAT, OpenAI, Stripe, etc.). Ce n'est pas lie au rebranding mais c'est une observation.
