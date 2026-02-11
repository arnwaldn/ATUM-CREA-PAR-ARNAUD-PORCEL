---
description: Forcer conscience complete (alias /wake debug) v27.0 (user)
---

# ULTRA-CREATE v27.0 - AWAKE (Force Full Consciousness)

> **ALIAS DE /wake** avec mode debug active.
> Utiliser quand `/wake` ne semble pas avoir active completement le systeme.

---

## FORCE ACTIVATION v27.0

### Etape 1: Verification Infrastructure
```bash
# Forcer Docker
docker ps || (docker start & sleep 10)

# Forcer Hindsight health check
curl -s http://localhost:8888/health || echo "Hindsight non disponible"
```

### Etape 2: Force Memory Load (6 Banks)
```javascript
// EXECUTION PARALLELE FORCEE - tous dans le meme message
mcp__hindsight__hindsight_list_banks()
mcp__hindsight__hindsight_recall({bank: 'ultra-dev-memory', query: 'ALL patterns solutions', top_k: 20})
mcp__hindsight__hindsight_recall({bank: 'errors', query: 'ALL errors fixes', top_k: 15})
mcp__hindsight__hindsight_recall({bank: 'patterns', query: 'ALL workflows templates', top_k: 15})
mcp__hindsight__hindsight_recall({bank: 'documents', query: 'ALL documents', top_k: 10})
mcp__hindsight__hindsight_recall({bank: 'research', query: 'ALL research', top_k: 10})
mcp__hindsight__hindsight_recall({bank: 'trading-brain', query: 'ALL strategies', top_k: 10})
mcp__hindsight__hindsight_stats({bank: 'ultra-dev-memory'})
```

### Etape 3: Force Knowledge Graph
```javascript
mcp__memory__read_graph()
mcp__memory__search_nodes('ULTRA-CREATE')
mcp__memory__search_nodes('agent')
mcp__memory__search_nodes('pattern')
```

---

## INVENTAIRE FORCE v27.0

| Composant | Valeur | Status |
|-----------|--------|--------|
| **MCPs** | 62 (+ mcp-memory-service) | Actif |
| **Agents** | 131 (33 categories) | Actif |
| **Commandes** | 41 slash + NL | Actif |
| **Templates** | 149+ (107 AI agents) | Actif |
| **Hooks** | 18 actifs | Actif |
| **Modes** | 8 (Ultra Think = defaut) | Actif |
| **Banks** | 6 Hindsight | Actif |

---

## FEATURES v27.0 FORCEES

| Feature | Description |
|---------|-------------|
| **VIBE-MASTER** | Pipeline autonome unifie |
| **Multi-Agent** | Parallelisme +90% performance |
| **Self-Healing** | 3 quality gates + auto-fix |
| **Context Monitor** | 60/80/95% thresholds |
| **Ultra Think** | Triple verification permanente |
| **Auto-Discovery** | registry + manifest + dispatcher |

---

## MODE DEBUG ACTIF

```
+======================================================================+
|           ULTRA-CREATE v27.0 - AWAKE MODE (FORCE DEBUG)              |
+======================================================================+
|                                                                       |
|  [FORCE] Hindsight    : 6 banks - rechargement force                  |
|  [FORCE] Memory Graph : Lecture complete forcee                       |
|  [FORCE] All MCPs     : 62 serveurs - verification                    |
|  [FORCE] All Agents   : 131 specialistes - ready                      |
|  [FORCE] All Hooks    : 18 actifs - verification                      |
|                                                                       |
+-----------------------------------------------------------------------+
|  MODE: LEAD ENGINEER + ULTRA THINK (FORCE PERMANENT)                  |
|  DEBUG: Verbose logging active                                        |
|  VALIDATION: Triple check force sur chaque action                     |
+======================================================================+
```

---

## DIFFERENCE /wake vs /awake

| Aspect | /wake | /awake |
|--------|-------|--------|
| **Mode** | Normal | Debug force |
| **Memory** | Load standard | Load COMPLET force |
| **Logging** | Normal | Verbose |
| **Validation** | Triple | Triple + logs detailles |
| **Usage** | Activation normale | Quand /wake semble incomplet |

---

**AWAKE = WAKE + DEBUG FORCE**
**Utiliser si comportement semble limite apres /wake**
