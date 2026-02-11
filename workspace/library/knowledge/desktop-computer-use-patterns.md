# Desktop Computer Use Patterns - ULTRA-CREATE

> **Source**: https://github.com/e2b-dev/open-computer-use (1.8k stars)
> **Version**: Janvier 2026
> **Statut**: Patterns pour automation desktop via E2B

---

## 1. VISION-ACTION LOOP (P0 - Pattern Principal)

### Concept
Boucle autonome pour contrôle desktop sans API:

```
Screenshot → Vision LLM → Parse UI → Generate Action → Execute → Repeat
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VISION-ACTION LOOP                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐                                           │
│  │ 1. CAPTURE   │ → desktop.screenshot()                    │
│  └──────┬───────┘                                           │
│         ▼                                                   │
│  ┌──────────────┐                                           │
│  │ 2. VISION    │ → Vision LLM analyse screenshot           │
│  └──────┬───────┘                                           │
│         ▼                                                   │
│  ┌──────────────┐                                           │
│  │ 3. PARSE     │ → OmniParser extrait UI elements          │
│  └──────┬───────┘                                           │
│         ▼                                                   │
│  ┌──────────────┐                                           │
│  │ 4. ACTION    │ → Action LLM génère prochaine action      │
│  └──────┬───────┘                                           │
│         ▼                                                   │
│  ┌──────────────┐                                           │
│  │ 5. EXECUTE   │ → click(x,y) / type("text") / scroll()    │
│  └──────┬───────┘                                           │
│         ▼                                                   │
│  ┌──────────────┐                                           │
│  │ 6. CHECK     │ → Task complete? If not → Loop            │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Code Pattern

```python
# Vision-Action Loop Pattern
async def vision_action_loop(task: str, sandbox: Desktop):
    max_iterations = 50
    iteration = 0

    while iteration < max_iterations:
        # 1. Capture current state
        screenshot = await sandbox.screenshot()

        # 2. Vision Analysis
        ui_analysis = await vision_llm.analyze(
            image=screenshot,
            prompt=f"Task: {task}\nDescribe UI elements and current state."
        )

        # 3. Parse UI Elements (OmniParser)
        elements = await grounding_model.parse(screenshot)

        # 4. Generate Action
        action = await action_llm.decide(
            task=task,
            ui_state=ui_analysis,
            elements=elements,
            history=action_history
        )

        # 5. Execute Action
        if action.type == "click":
            await sandbox.click(action.x, action.y)
        elif action.type == "type":
            await sandbox.type(action.text)
        elif action.type == "scroll":
            await sandbox.scroll(action.dx, action.dy)
        elif action.type == "hotkey":
            await sandbox.hotkey(*action.keys)
        elif action.type == "done":
            return {"success": True, "iterations": iteration}

        # 6. Record history
        action_history.append(action)
        iteration += 1

        # Wait for UI to stabilize
        await asyncio.sleep(0.5)

    return {"success": False, "reason": "max_iterations_reached"}
```

### Avantages
- Fonctionne avec TOUTE interface graphique (GUI, pas seulement web)
- Pas besoin d'API ou DOM
- Mimique comportement humain
- Robuste aux changements UI mineurs
- Indépendant du système d'exploitation

---

## 2. OMNIPARSER PATTERN (P0 - UI Tokenization)

### Concept
Convertir screenshots pixel en éléments UI structurés pour réduire les hallucinations LLM.

```
Screenshot (pixels) → OmniParser → Structured UI Elements (JSON)
```

### Structure Parsée

```json
{
  "screen_size": [1920, 1080],
  "elements": [
    {
      "id": 1,
      "type": "button",
      "text": "Submit",
      "coords": [450, 320],
      "size": [120, 40],
      "interactable": true
    },
    {
      "id": 2,
      "type": "input",
      "placeholder": "Enter email",
      "coords": [300, 200],
      "size": [250, 35],
      "interactable": true,
      "focused": false
    },
    {
      "id": 3,
      "type": "text",
      "content": "Welcome to the application",
      "coords": [200, 100],
      "interactable": false
    }
  ]
}
```

### Modèles de Grounding Recommandés

| Modèle | Provider | Spécialité |
|--------|----------|------------|
| **OS-Atlas** | Microsoft | UI element detection, cross-platform |
| **ShowUI** | Open-source | Alternative légère |
| **OmniParser v2** | Microsoft Research | High accuracy |

### Prompt Pattern pour Grounding

```python
GROUNDING_PROMPT = """
Analyze this screenshot and identify all interactable UI elements.
For each element, provide:
- Type (button, input, link, checkbox, dropdown, etc.)
- Text or placeholder content
- Bounding box coordinates [x, y, width, height]
- Whether it's currently interactable

Output in JSON format.
"""
```

### Avantages
- Réduit hallucinations LLM (coordonnées explicites)
- Permet références sémantiques ("click Submit button")
- Améliore précision des actions
- Facilite debugging et logging

---

## 3. MULTI-MODEL SPECIALIZATION (P1)

### Architecture 3 Modèles

```
┌────────────────────────────────────────────────────────────┐
│                 MULTI-MODEL PIPELINE                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│  │ VISION LLM  │ → │  GROUNDING  │ → │ ACTION LLM  │      │
│  │             │   │   MODEL     │   │             │      │
│  │ Llama 3.2   │   │  OS-Atlas   │   │   Claude    │      │
│  │ 90B Vision  │   │   ShowUI    │   │   Sonnet    │      │
│  │             │   │             │   │             │      │
│  │ Understands │   │  Locates    │   │  Decides    │      │
│  │ screenshots │   │  elements   │   │  actions    │      │
│  └─────────────┘   └─────────────┘   └─────────────┘      │
│       $$               $                $$$                │
└────────────────────────────────────────────────────────────┘
```

### Configuration Recommandée

| Role | Modèle Principal | Alternative | Coût |
|------|------------------|-------------|------|
| **Vision** | Llama 3.2-90B Vision | Claude Vision | $$ |
| **Grounding** | OS-Atlas | ShowUI | $ |
| **Action** | Claude Sonnet | GPT-4o | $$$ |

### Code Pattern

```python
class MultiModelPipeline:
    def __init__(self):
        # Vision: Comprendre le screenshot
        self.vision_llm = LlamaVision("llama-3.2-90b-vision")

        # Grounding: Localiser les éléments
        self.grounding = OSAtlas()

        # Action: Décider quoi faire
        self.action_llm = Claude("claude-sonnet")

    async def process(self, screenshot, task, history):
        # Step 1: Vision understanding
        scene_description = await self.vision_llm.describe(screenshot)

        # Step 2: Element grounding
        elements = await self.grounding.parse(screenshot)

        # Step 3: Action decision
        action = await self.action_llm.decide(
            task=task,
            scene=scene_description,
            elements=elements,
            history=history
        )

        return action
```

### Avantages
- Optimisation coût/qualité par tâche
- Modèles rapides pour parsing, puissants pour décisions
- Swap providers sans changer le code
- Fallback entre providers

---

## 4. E2B DESKTOP SANDBOX

### Installation

```bash
pip install e2b-desktop
```

### Utilisation Basique

```python
from e2b_desktop import Desktop

# Créer sandbox (boot < 200ms)
async with Desktop() as desktop:
    # Capture screenshot
    screenshot = await desktop.screenshot()

    # Actions souris
    await desktop.click(450, 320)           # Click gauche
    await desktop.right_click(450, 320)     # Click droit
    await desktop.double_click(450, 320)    # Double-click
    await desktop.move(500, 400)            # Déplacer curseur

    # Actions clavier
    await desktop.type("Hello World")       # Taper du texte
    await desktop.hotkey("ctrl", "c")       # Raccourci clavier
    await desktop.hotkey("alt", "tab")      # Alt+Tab

    # Scroll
    await desktop.scroll(0, -100)           # Scroll up
    await desktop.scroll(0, 100)            # Scroll down

    # Drag & Drop
    await desktop.drag(100, 100, 500, 500)
```

### Actions Avancées

```python
# Exécuter commande shell
result = await desktop.run_command("ls -la")

# Ouvrir application
await desktop.run_command("firefox https://example.com")

# File operations
await desktop.upload_file("/local/path.txt", "/sandbox/path.txt")
content = await desktop.download_file("/sandbox/output.txt")

# Browser dans sandbox
await desktop.run_command("chromium --new-window https://google.com")
```

### Best Practices

1. **Timeout par action** (30s default)
2. **Screenshot après chaque action** pour vérification
3. **Retry avec exponential backoff** si échec
4. **Cleanup sandbox** en fin de tâche
5. **Logging** de toutes les actions pour debugging

```python
async def safe_action(desktop, action_fn, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = await asyncio.wait_for(action_fn(), timeout=30)
            screenshot = await desktop.screenshot()  # Verify
            return result, screenshot
        except asyncio.TimeoutError:
            await asyncio.sleep(2 ** attempt)
    raise ActionFailedError(f"Failed after {max_retries} attempts")
```

---

## 5. SÉCURITÉ

### Isolation Firecracker

E2B utilise Firecracker (AWS) pour l'isolation:

| Aspect | Container Docker | Firecracker microVM |
|--------|------------------|---------------------|
| **Kernel** | Partagé avec host | Propre kernel |
| **Isolation** | Namespace/cgroups | Hardware-level |
| **Escape risk** | Possible | Quasi-impossible |
| **Boot time** | ~1s | <200ms |
| **Overhead** | ~50MB | ~5MB |

### Recommandations Sécurité

```python
# 1. Ne JAMAIS passer de credentials dans sandbox
# MAUVAIS
await desktop.type(os.environ["API_KEY"])

# BON - utiliser fichiers temporaires sécurisés
with tempfile.NamedTemporaryFile() as f:
    f.write(encrypted_config)
    await desktop.upload_file(f.name, "/sandbox/config.enc")

# 2. Limiter network access
sandbox = Desktop(network_policy="isolated")

# 3. Timeout sur tâches longues
async with asyncio.timeout(300):  # 5 minutes max
    await vision_action_loop(task, sandbox)

# 4. Audit logging
logger.info(f"Action: {action.type} at {action.coords}")
```

### Domain Allowlist

```python
ALLOWED_DOMAINS = [
    "localhost",
    "*.internal.company.com",
    "github.com",
    "docs.anthropic.com"
]

async def check_navigation(url):
    hostname = urlparse(url).hostname
    if not any(fnmatch(hostname, pattern) for pattern in ALLOWED_DOMAINS):
        raise SecurityError(f"Navigation to {hostname} blocked")
```

---

## 6. INTÉGRATION ULTRA-CREATE

### MCP Existant

E2B MCP déjà configuré dans ULTRA-CREATE:
- `mcp__e2b__run_code` - Exécuter code dans sandbox
- `mcp__e2b__desktop_*` - Actions desktop

### Quand Utiliser Desktop vs Browser

| Scénario | Outil Recommandé |
|----------|------------------|
| Web scraping | Playwright (browser MCP) |
| Form filling web | Playwright |
| Desktop app automation | **E2B Desktop** |
| GUI testing natif | **E2B Desktop** |
| Multi-app workflow | **E2B Desktop** |
| PDF manipulation | **E2B Desktop** |
| Office automation | **E2B Desktop** |

### Template Usage

```python
# Dans un agent ULTRA-CREATE
from e2b_desktop import Desktop

async def automate_desktop_task(task_description: str):
    """
    Automatise une tâche desktop via Vision-Action Loop.

    Args:
        task_description: Description en langage naturel

    Returns:
        Résultat de la tâche
    """
    async with Desktop() as sandbox:
        result = await vision_action_loop(
            task=task_description,
            sandbox=sandbox,
            max_iterations=50,
            timeout=300
        )
        return result
```

---

## 7. PROVIDERS LLM SUPPORTÉS

### Vision Models

| Provider | Modèle | Qualité | Coût |
|----------|--------|---------|------|
| Meta | Llama 3.2-90B Vision | Excellent | $$ |
| Anthropic | Claude (vision) | Excellent | $$$ |
| OpenAI | GPT-4o | Excellent | $$$ |
| Google | Gemini 2.0 Flash | Bon | $$ |
| Mistral | Pixtral | Bon | $ |

### Action Models

| Provider | Modèle | Qualité | Coût |
|----------|--------|---------|------|
| Anthropic | Claude Sonnet | Excellent | $$$ |
| OpenAI | GPT-4o | Excellent | $$$ |
| Meta | Llama 3.3-70B | Bon | $$ |
| DeepSeek | DeepSeek-V3 | Bon | $ |
| Groq | Llama (fast) | Bon | $ |

### Configuration Multi-Provider

```python
PROVIDER_CONFIG = {
    "vision": {
        "primary": "meta/llama-3.2-90b-vision",
        "fallback": "anthropic/claude-sonnet"
    },
    "grounding": {
        "primary": "microsoft/os-atlas",
        "fallback": "showui/showui"
    },
    "action": {
        "primary": "anthropic/claude-sonnet",
        "fallback": "openai/gpt-4o"
    }
}
```

---

## 8. TROUBLESHOOTING

### Problèmes Courants

| Problème | Cause | Solution |
|----------|-------|----------|
| Click manqué | Coordonnées imprécises | Utiliser OmniParser |
| Action timeout | UI lente | Augmenter wait time |
| Sandbox crash | Memory limit | Réduire resolution |
| Element not found | Page pas chargée | Ajouter wait explicite |

### Debug Pattern

```python
async def debug_action(desktop, action):
    # Screenshot avant
    before = await desktop.screenshot()
    save_debug_image(before, "before_action.png")

    # Exécuter action
    await execute_action(desktop, action)

    # Screenshot après
    await asyncio.sleep(1)  # Wait for UI update
    after = await desktop.screenshot()
    save_debug_image(after, "after_action.png")

    # Diff visual
    diff = compare_screenshots(before, after)
    if diff < 0.01:
        logger.warning("No visual change detected after action")
```

---

## SOURCES

- [Open Computer Use](https://github.com/e2b-dev/open-computer-use) - 1.8k stars
- [E2B Desktop Sandbox](https://github.com/e2b-dev/desktop)
- [E2B Documentation](https://e2b.dev/docs)
- [OmniParser v2 (Microsoft Research)](https://www.microsoft.com/en-us/research/articles/omniparser-v2-turning-any-llm-into-a-computer-use-agent/)
- [Firecracker vs QEMU](https://e2b.dev/blog/firecracker-vs-qemu)
- [How Manus Uses E2B](https://e2b.dev/blog/how-manus-uses-e2b-to-provide-agents-with-virtual-computers)

---

*ULTRA-CREATE v28.5 | Pattern: desktop-computer-use | Source: E2B Open Computer Use*
*CMP Score: 7.5/10 | Couverture: Desktop Automation ~90%*
