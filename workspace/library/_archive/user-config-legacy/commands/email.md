---
description: Gmail automation (read, compose, search) (user)
---

# /email - Gmail Automation

## USAGE
```
/email read --unread                     # Emails non lus
/email compose --to="x@y.com" --subject="Test"
/email search "facture janvier"
/email summarize --since="today"
```

## ACTIONS

### READ - Lire emails
```
/email read                    # 10 derniers
/email read --unread           # Non lus uniquement
/email read --from="boss@co"   # D'un expediteur
/email read --label="urgent"   # Par label
```

### COMPOSE - Rediger
```
/email compose --to="x@y.com" --subject="Sujet" --body="Contenu"
/email compose --template="followup" --to="x@y.com"
/email compose --reply-to="[message-id]"
```

### SEARCH - Rechercher
```
/email search "facture"
/email search "from:client subject:urgent"
/email search "after:2024/01/01 before:2024/02/01"
```

### SUMMARIZE - Resume
```
/email summarize --since="today"
/email summarize --since="week" --important
```

## TEMPLATES DISPONIBLES

| Template | Usage |
|----------|-------|
| `followup` | Suivi de projet/tache |
| `meeting` | Demande de reunion |
| `update` | Mise a jour projet |
| `intro` | Introduction/presentation |
| `thanks` | Remerciement |

### Utilisation template
```
/email compose --template="followup" --to="client@co.com" --context="Projet X"
```

## WORKFLOW COMPOSE

1. **Analyse contexte** (si --context fourni)
   - Rechercher conversations precedentes
   - Identifier ton approprie

2. **Generation draft**
   - Appliquer template si specifie
   - Personnaliser selon contexte

3. **Review utilisateur**
   - Afficher draft
   - Demander confirmation avant envoi

4. **Envoi** (apres confirmation)

## OPTIONS GLOBALES

| Option | Description |
|--------|-------------|
| --dry-run | Simuler sans envoyer |
| --format="brief" | Output compact |
| --limit=N | Nombre de resultats |

## SECURITE
- Jamais d'envoi automatique sans confirmation
- Credentials via OAuth (pas en clair)
- Logs des actions effectuees

## MCP REQUIS
- Gmail API (configuration requise)
- Hindsight (historique actions)
