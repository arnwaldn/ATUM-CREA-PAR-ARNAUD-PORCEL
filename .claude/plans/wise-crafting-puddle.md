# ATUM CREA - Phase 2 : Cablage du Bridge dans Auto-Claude

## Contexte

L'audit approfondi du systeme ATUM CREA a revele un probleme critique :
le module bridge (`apps/backend/bridge/`) contenant 4 fichiers Python + 1 fichier TypeScript
est **completement deconnecte** du runtime Auto-Claude. Zero imports, zero references.

Le bridge existe physiquement mais n'est jamais appele. C'est du code orphelin.

**Ce plan decrit les modifications minimales pour cabler le bridge dans le pipeline d'execution.**

### Ce qui fonctionne deja
- ECC installe dans `~/.claude/` : 13 agents, 24 rules, 29 skills, 31 commands, 9 hooks, 3 contexts
- Frontend : `ecc-env.ts` importe et utilise `getECCEnvVars()` dans `agent-process.ts` (ligne 27/210)
- Backend : 4 fichiers bridge existent (`ecc_injector.py`, `context_loader.py`, `hooks_manager.py`, `instinct_store.py`)
- TypeScript compile sans erreurs

### Ce qui ne fonctionne pas
1. **Bridge orphelin** : aucun import depuis le code Auto-Claude
2. **Chemins hardcodes** : Desktop paths dans `ecc_injector.py:132` et `context_loader.py:49`
3. **Contextes non injectes** : `get_context_prompt_prefix()` jamais appele
4. **Instincts non synchro** : `to_graphiti_nodes()` jamais appele

---

## Pipeline d'execution Auto-Claude (reference)

```
run.py → cli/main.py → cli/build_commands.py:handle_build_command()
  ├─ print_banner() + print project info (ligne 104)
  ├─ validate_environment() (ligne 125)
  └─ asyncio.run(run_autonomous_agent(...))
        ├─ debug_memory_system_status() (ligne 340)
        ├─ Linear status print (ligne 352-361)
        ├─ is_first_run() → planning vs coding (ligne 364)
        └─ create_client() per session (core/client.py:444)
              ├─ sdk_env = get_sdk_env_vars() (ligne 493)
              ├─ configure_sdk_authentication() (ligne 500)
              ├─ Build security settings (lignes 556-654)
              ├─ base_prompt + CLAUDE.md (lignes 784-794)
              └─ ClaudeSDKClient(env=sdk_env) (ligne 810/837)
```

---

## Modifications (7 fichiers, ~110 lignes ajoutees)

### 1. Corriger les chemins hardcodes dans le bridge

**`apps/backend/bridge/ecc_injector.py`** - Ligne 132
```python
# AVANT (hardcode Desktop)
ecc_source = Path.home() / "Desktop" / "ATUM CREA" / "everything-claude-code" / "contexts"

# APRES (utilise ~/.claude/ standard)
ecc_source = self._claude_dir / "contexts"
```

**`apps/backend/bridge/context_loader.py`** - Lignes 48-52
```python
# AVANT
self._contexts_dir = contexts_dir or (
    Path.home() / "Desktop" / "ATUM CREA" / "everything-claude-code" / "contexts"
)

# APRES
self._contexts_dir = contexts_dir or (Path.home() / ".claude" / "contexts")
```

Les 3 fichiers contexte existent deja dans `~/.claude/contexts/` : `dev.md`, `research.md`, `review.md`.

### 2. Ajouter le mapping agent_type → phase

**`apps/backend/bridge/ecc_injector.py`** - Apres ligne 156, nouvelle methode statique :

```python
@staticmethod
def agent_type_to_phase(agent_type: str) -> str:
    """Map Auto-Claude agent_type to ECC phase name."""
    mapping = {
        "planner": "planning",
        "coder": "coding",
        "qa_reviewer": "qa",
        "qa_fixer": "qa_fix",
        "spec_gatherer": "setup",
        "spec_researcher": "setup",
        "spec_writer": "spec_creation",
        "spec_critic": "review",
        "merge_resolver": "merge",
        "pr_template_filler": "review",
    }
    return mapping.get(agent_type, "coding")
```

### 3. Declarer les env vars ATUM_CREA dans le SDK

**`apps/backend/core/auth.py`** - Apres ligne 66 (fin de `SDK_ENV_VARS`), ajouter :

```python
# ATUM CREA / ECC bridge environment variables
ATUM_CREA_ENV_VARS = [
    "ATUM_CREA_ENABLED",
    "ATUM_CREA_ECC_DIR",
    "ATUM_CREA_AGENTS_COUNT",
    "ATUM_CREA_RULES_COUNT",
    "ATUM_CREA_SKILLS_COUNT",
    "ATUM_CREA_COMMANDS_COUNT",
    "ATUM_CREA_PHASE",
    "ATUM_CREA_CONTEXT",
    "ATUM_CREA_CONTEXT_PATH",
]
```

Pas besoin de les ajouter a `SDK_ENV_VARS` car on les injectera directement dans `sdk_env` via `create_client()`.

### 4. Creer le module d'affichage status

**Nouveau fichier : `apps/backend/bridge/status.py`** (~50 lignes)

Suit le pattern exact de `debug_memory_system_status()` et du statut Linear :

```python
"""ECC Bridge status display - follows Linear/Graphiti pattern."""

import logging
from bridge.ecc_injector import ECCInjector, ECCConfig
from ui import print_status, print_key_value

logger = logging.getLogger(__name__)

def print_ecc_status() -> ECCConfig | None:
    """Print ECC status at startup. Returns config if detected, None otherwise."""
    try:
        injector = ECCInjector()
        config = injector.detect()
        total = len(config.agents) + len(config.rules) + len(config.skills) + len(config.commands)
        if total == 0:
            return None

        print_status("ATUM CREA (ECC): DETECTED", "success")
        print_key_value("Agents", str(len(config.agents)))
        print_key_value("Rules", str(len(config.rules)))
        print_key_value("Skills", str(len(config.skills)))
        print_key_value("Commands", str(len(config.commands)))
        if config.contexts:
            print_key_value("Contexts", ", ".join(sorted(config.contexts.keys())))
        print()
        return config
    except Exception as e:
        logger.debug(f"ECC status check failed: {e}")
        return None
```

### 5. Injecter dans `create_client()` (point d'integration principal)

**`apps/backend/core/client.py`**

**Import conditionnel (debut du fichier, apres ligne 22) :**
```python
try:
    from bridge.ecc_injector import ECCInjector
    _ECC_AVAILABLE = True
except ImportError:
    _ECC_AVAILABLE = False
```

**Injection env vars (apres ligne 493, apres `sdk_env = get_sdk_env_vars()`) :**
```python
# Inject ECC environment variables if bridge is available
if _ECC_AVAILABLE:
    try:
        injector = ECCInjector()
        ecc_config = injector.detect()
        phase = injector.agent_type_to_phase(agent_type)
        ecc_env = injector.build_env_vars(ecc_config, phase)
        sdk_env.update(ecc_env)
        logger.debug(f"ECC bridge: injected {len(ecc_env)} env vars for phase '{phase}'")
    except Exception as e:
        logger.debug(f"ECC bridge injection skipped: {e}")
```

**Injection contexte dans le prompt (apres ligne 794, apres la section CLAUDE.md) :**
```python
# Include ECC context if available
if _ECC_AVAILABLE:
    try:
        from bridge.context_loader import ContextLoader
        phase = ECCInjector.agent_type_to_phase(agent_type)
        context_loader = ContextLoader()
        context_prefix = context_loader.get_context_prompt_prefix(phase)
        if context_prefix:
            base_prompt = f"{base_prompt}\n\n{context_prefix}"
            print(f"   - ATUM CREA context: {phase}")
    except Exception as e:
        logger.debug(f"ECC context injection skipped: {e}")
```

### 6. Afficher le statut au demarrage de l'agent

**`apps/backend/agents/coder.py`**

**Import (apres les imports existants, ~ligne 60) :**
```python
# ECC bridge status (graceful failure)
try:
    from bridge.status import print_ecc_status
    _ECC_STATUS_AVAILABLE = True
except ImportError:
    _ECC_STATUS_AVAILABLE = False
```

**Appel (apres le statut Linear, ~ligne 362, avant `first_run = is_first_run(spec_dir)`) :**
```python
# Check ECC integration status
if _ECC_STATUS_AVAILABLE:
    print_ecc_status()
```

### 7. Mettre a jour `bridge/__init__.py`

**`apps/backend/bridge/__init__.py`** - Ajouter les exports des dataclasses :

```python
"""ATUM CREA Bridge - ECC <-> Auto-Claude Integration Layer."""

from bridge.ecc_injector import ECCInjector, ECCConfig
from bridge.context_loader import ContextLoader, Context
from bridge.hooks_manager import HooksManager, MergedHooks
from bridge.instinct_store import InstinctStore, Instinct
from bridge.status import print_ecc_status

__all__ = [
    "ECCInjector", "ECCConfig",
    "ContextLoader", "Context",
    "HooksManager", "MergedHooks",
    "InstinctStore", "Instinct",
    "print_ecc_status",
]
```

---

## Ordre d'execution

| # | Fichier | Action | Risque |
|---|---------|--------|--------|
| 1 | `bridge/ecc_injector.py` | Fix chemin + ajouter mapping | Bas |
| 2 | `bridge/context_loader.py` | Fix chemin | Bas |
| 3 | `bridge/status.py` | Creer (nouveau fichier) | Aucun |
| 4 | `bridge/__init__.py` | Mettre a jour exports | Bas |
| 5 | `core/client.py` | Import conditionnel + injection env + injection contexte | Moyen |
| 6 | `agents/coder.py` | Import conditionnel + affichage statut | Bas |
| 7 | `core/auth.py` | Declarer constantes ATUM_CREA_ENV_VARS | Bas |

---

## Verification

### Test 1 : Import bridge depuis Python
```bash
cd apps/backend
python -c "from bridge import ECCInjector; c = ECCInjector(); print(c.detect())"
```

### Test 2 : Mapping agent_type → phase
```bash
cd apps/backend
python -c "from bridge import ECCInjector; i = ECCInjector(); print(i.agent_type_to_phase('planner'), i.agent_type_to_phase('qa_reviewer'))"
# Attendu : planning qa
```

### Test 3 : Env vars generes
```bash
cd apps/backend
python -c "
from bridge import ECCInjector
i = ECCInjector()
c = i.detect()
env = i.build_env_vars(c, 'coding')
for k, v in sorted(env.items()):
    print(f'{k}={v}')
"
```

### Test 4 : Contexte charge
```bash
cd apps/backend
python -c "
from bridge import ContextLoader
cl = ContextLoader()
ctx = cl.load_for_phase('coding')
print(f'Context: {ctx.name}, Mode: {ctx.mode}' if ctx else 'No context')
"
```

### Test 5 : Status display
```bash
cd apps/backend
python -c "from bridge.status import print_ecc_status; print_ecc_status()"
```

### Test 6 : Integration complete (si OAuth configure)
```bash
cd apps/backend
python run.py --list
# Doit montrer les specs sans erreur d'import bridge
```

---

## Degradation gracieuse

Tous les imports bridge utilisent `try/except ImportError` :
- Si le bridge a un bug d'import → `_ECC_AVAILABLE = False` → Auto-Claude fonctionne normalement
- Si ECC n'est pas installe → `detect()` retourne 0 composants → pas d'injection
- Si un fichier contexte manque → `load_for_phase()` retourne `None` → pas d'injection prompt
- Aucune modification ne casse le flux existant d'Auto-Claude
