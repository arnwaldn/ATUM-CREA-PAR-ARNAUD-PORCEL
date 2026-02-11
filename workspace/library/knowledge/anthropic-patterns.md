# Anthropic Official Patterns - claude-quickstarts

> **Source**: https://github.com/anthropics/claude-quickstarts (13.6k stars)
> **Version**: Janvier 2026
> **Statut**: Patterns officiels Anthropic pour développement autonome

---

## 1. TWO-AGENT PATTERN (Autonomous Coding)

### Concept
Système multi-agent séquentiel pour tâches longues sur plusieurs sessions:

```
Session 1: INITIALIZER AGENT
  └─→ Crée feature_list.json (200+ test cases)
  └─→ Setup projet + git init

Sessions 2+: CODING AGENT
  └─→ Lit feature_list.json
  └─→ Implémente 1 feature à la fois
  └─→ Marque passing: true
  └─→ Git commit
  └─→ Continue automatiquement...
```

### feature_list.json Structure
```json
{
  "features": [
    {
      "id": 1,
      "description": "User can create an account",
      "tests": ["email validation", "password strength"],
      "passing": false
    },
    {
      "id": 2,
      "description": "User can login",
      "tests": ["valid credentials", "invalid credentials"],
      "passing": false
    }
  ]
}
```

### Règle Critique
> "IT IS CATASTROPHIC TO REMOVE OR EDIT FEATURES IN FUTURE SESSIONS.
> Features can ONLY be marked as passing."

Cette règle empêche le drift de spécification entre sessions.

### Avantages
- Continuité entre sessions (contexte frais mais état persistant)
- Pas de perte de spécification
- Git commits par feature (traçabilité)
- Pause/Resume avec Ctrl+C

### Quand Utiliser
- Projets longs (plusieurs heures/jours)
- Applications complètes (200+ features)
- Travail en équipe (plusieurs sessions)

---

## 2. GIT-BASED PERSISTENCE

### Concept
Persistance d'état via Git + JSON au lieu de services externes:

```
État Session = feature_list.json + git commits + progress.txt
```

### Flow
```python
# 1. Feature complétée
feature["passing"] = True

# 2. Persist JSON
with open("feature_list.json", "w") as f:
    json.dump(features, f)

# 3. Git commit
git add .
git commit -m "Feature {id}: {description}"

# 4. Session suivante lit JSON et continue
```

### Avantages vs Services Externes
| Aspect | Git Local | Service Externe (Hindsight) |
|--------|-----------|----------------------------|
| Fiabilité | 99.9% | ~95% (dépend du service) |
| Recovery | `git log` | API call |
| Offline | Oui | Non |
| Historique | Immutable | Peut être modifié |

---

## 3. SECURITY ALLOWLIST (Best Practice)

### Approche Correcte: WHITELIST (Default Deny)
```python
# SÉCURISÉ - Tout ce qui n'est pas explicitement autorisé est BLOQUÉ
ALLOWED_COMMANDS = {
    # Inspection fichiers
    "ls", "cat", "head", "tail", "wc", "grep", "find",
    # Node.js
    "npm", "npx", "node", "yarn", "pnpm",
    # Python
    "python", "pip", "uv", "uvx",
    # Version control
    "git",
    # Process management
    "ps", "lsof", "sleep", "pkill",
    # Build tools
    "make", "cargo", "go"
}

def validate_command(cmd: str) -> bool:
    base_cmd = cmd.split()[0]
    return base_cmd in ALLOWED_COMMANDS
```

### Approche Dangereuse: BLACKLIST (À Éviter!)
```python
# DANGEREUX - Un attaquant peut contourner facilement
BLOCKED = ["/rm -rf/", "/DROP TABLE/"]

# rm -rf bloqué → rm -r passe!
# DROP TABLE bloqué → drop table (lowercase) passe!
```

### Commandes Recommandées par Catégorie

| Catégorie | Commandes |
|-----------|-----------|
| **Inspection** | ls, cat, head, tail, wc, grep, find, file |
| **Node.js** | npm, npx, node, yarn, pnpm |
| **Python** | python, pip, uv, uvx, poetry |
| **Git** | git |
| **Build** | make, cargo, go, rustc |
| **Process** | ps, lsof, sleep, pkill (dev processes only) |

### Commandes à NE JAMAIS Autoriser
- `rm` (sauf avec restrictions)
- `curl`, `wget` (risque exfiltration)
- `dd`, `mkfs` (destruction système)
- `chmod 777`, `chown` (escalade privilèges)
- `sudo`, `su` (root access)

---

## 4. BROWSER AUTOMATION DOM-BASED

### Concept
Ciblage d'éléments via `ref` (DOM reference) au lieu de coordonnées pixel:

```python
# FRAGILE - Coordonnées cassent sur resize
click(x=450, y=320)

# STABLE - Référence DOM fonctionne partout
click(ref="button-submit")
```

### Actions Browser Disponibles

**Navigation & Lecture**:
- `navigate(url)` - Aller à URL ou "back"/"forward"
- `read_page(filter="interactive")` - DOM tree avec refs
- `get_page_text()` - Texte complet de la page
- `find(text)` - Rechercher et surligner

**Interaction Formulaires**:
- `form_input(ref, value)` - Remplir champ
- `scroll_to(ref)` - Scroller vers élément

**Actions Souris** (acceptent ref OU coordinate):
- `left_click`, `right_click`, `double_click`
- `hover` - Survol pour tooltips
- `left_click_drag(start, end)` - Drag & drop

**Actions Clavier**:
- `type(text)` - Taper du texte
- `key(combo)` - Combinaison touches (ex: "Ctrl+C")

### Coordinate Scaling
```
Viewport réel: 1920x1080 (16:9)
      ↓
Vision Claude: 1456x819 (scaled)
      ↓
Auto-scale back: 1456x819 → 1920x1080
```

**Important**: Implémenter le scaling dans vos outils, pas via l'API.

---

## 5. SESSION LIFECYCLE

### Pattern Anthropic
```
┌────────────────────────────────────────┐
│ Session Start                          │
├────────────────────────────────────────┤
│ 1. Check feature_list.json exists?     │
│    - NO: Run Initializer Agent         │
│    - YES: Run Coding Agent             │
│                                        │
│ 2. Identify next incomplete feature    │
│                                        │
│ 3. Implement feature                   │
│                                        │
│ 4. Mark passing: true                  │
│                                        │
│ 5. Git commit                          │
│                                        │
│ 6. Check more features?                │
│    - YES: Continue (3 second delay)    │
│    - NO: Done!                         │
└────────────────────────────────────────┘
```

### Pause & Resume
```bash
# Démarrer
python agent.py --project-dir ./my_project

# Pause (Ctrl+C) → État sauvegardé automatiquement

# Resume (même commande)
python agent.py --project-dir ./my_project
```

---

## 6. CONTAINER ARCHITECTURE (Computer Use)

### Architecture Docker
```
┌──────────────────────────────────────┐
│ Docker Container                     │
├──────────────────────────────────────┤
│ Streamlit UI (:8080)                 │
│     ↓                                │
│ Claude API + Tools                   │
│     ↓                                │
│ Playwright/Chromium                  │
│     ↓                                │
│ XVFB Virtual Display                 │
│     ↓                                │
│ VNC/NoVNC (:5900, :6080)            │
└──────────────────────────────────────┘
```

### Ports
| Port | Service |
|------|---------|
| 8080 | Combined UI (chat + desktop) |
| 8501 | Streamlit only |
| 6080 | NoVNC (web browser) |
| 5900 | VNC direct |

### Résolution Recommandée
- **Optimal**: XGA 1024x768 (meilleure précision model)
- **Alternative**: 1920x1080 (avec scaling automatique)

---

## 7. SÉCURITÉ CONTAINER

### Recommandations Anthropic
1. **Isolation VM/Container** avec privilèges minimaux
2. **Pas d'accès** aux données sensibles/credentials
3. **Domain allowlist** pour réduire exposition
4. **Confirmation humaine** pour actions conséquentes
5. **Protection prompt injection** depuis pages web

### Filesystem Restrictions
```python
# Restreindre au project directory uniquement
PROJECT_DIR = Path("./my_project").resolve()

def validate_path(path: str) -> bool:
    abs_path = Path(path).resolve()
    return abs_path.is_relative_to(PROJECT_DIR)
```

---

## Comparaison ULTRA-CREATE vs QuickStarts

| Aspect | ULTRA-CREATE | QuickStarts |
|--------|--------------|-------------|
| Templates | 161 | ~40 |
| Agents | 161 + 37 synergies | 1 configurable |
| Hooks | 48 | 0 |
| Sécurité | Blacklist (faible) | Whitelist (forte) |
| Persistence | Hindsight (externe) | Git (local) |
| Complexité | Haute (riche) | Basse (simple) |

### Recommandation
**Approche hybride**:
- Garder richesse ULTRA-CREATE (templates, agents, hooks)
- Adopter sécurité QuickStarts (whitelist)
- Compléter persistence avec Git (en plus de Hindsight)

---

## Sources

- [autonomous-coding](https://github.com/anthropics/claude-quickstarts/tree/main/autonomous-coding)
- [browser-use-demo](https://github.com/anthropics/claude-quickstarts/tree/main/browser-use-demo)
- [computer-use-demo](https://github.com/anthropics/claude-quickstarts/tree/main/computer-use-demo)
- [Claude API Docs](https://docs.anthropic.com)

---

*ULTRA-CREATE v28.5 | Knowledge: anthropic-patterns | Source: Official Anthropic*
