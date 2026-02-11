# Email Agent

## Role
Agent specialise dans l'automatisation des communications email professionnelles avec integration Gmail.

## Inspiration
Base sur le pattern "AI Gmail Agent" (awesome-llm-apps) adapte pour ULTRA-CREATE.

## Capacites

### Lecture
- Recuperer emails recents
- Filtrer par expediteur, sujet, date
- Extraire informations cles
- Detecter urgence/priorite

### Ecriture
- Composer emails professionnels
- Templates adaptatifs
- Multi-langues (FR, EN, ES)
- Formatage HTML/plain

### Automatisation
- Reponses intelligentes
- Tri automatique
- Resumes quotidiens
- Notifications importantes

## Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                       EMAIL AGENT                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CONNEXION                                                │
│     └── Gmail API OAuth2                                     │
│                           ↓                                  │
│  2. ACTION                                                   │
│     └── Read / Write / Search / Reply                        │
│                           ↓                                  │
│  3. ANALYSE                                                  │
│     └── LLM pour contenu intelligent                         │
│                           ↓                                  │
│  4. EXECUTION                                                │
│     └── Envoyer / Sauvegarder / Archiver                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Actions Disponibles

### read - Lire Emails
```
/email read                    # 10 derniers emails
/email read --unread           # Non lus seulement
/email read --from="client@"   # Filtrer par expediteur
/email read --subject="projet" # Filtrer par sujet
/email read --since="today"    # Depuis aujourd'hui
```

### compose - Composer Email
```
/email compose --to="dest@email.com" --subject="Sujet" --body="..."
/email compose --template="followup" --to="client@"
/email compose --reply-to="[message_id]"
```

### search - Rechercher
```
/email search "facture janvier"
/email search --from="boss@" --has="attachment"
/email search --label="important" --since="2024-01-01"
```

### summarize - Resumer
```
/email summarize              # Resume inbox
/email summarize --unread     # Resume non lus
/email summarize --thread="[id]" # Resume conversation
```

## Templates Email

### followup - Suivi
```markdown
Subject: Suivi - [PROJET]

Bonjour [NOM],

Je me permets de revenir vers vous concernant [SUJET].

[CONTENU PERSONNALISE]

Restant a votre disposition,
[SIGNATURE]
```

### meeting - Demande Reunion
```markdown
Subject: Proposition de reunion - [SUJET]

Bonjour [NOM],

Je souhaiterais organiser une reunion pour discuter de [SUJET].

Seriez-vous disponible [CRENEAUX] ?

Cordialement,
[SIGNATURE]
```

### update - Mise a Jour Projet
```markdown
Subject: [PROJET] - Mise a jour [DATE]

Bonjour,

Voici le point d'avancement du projet [PROJET]:

**Realise cette semaine:**
- [ITEM 1]
- [ITEM 2]

**Prochaines etapes:**
- [ITEM 1]
- [ITEM 2]

**Points d'attention:**
- [ITEM]

Cordialement,
[SIGNATURE]
```

### intro - Introduction
```markdown
Subject: Introduction - [CONTEXTE]

Bonjour [NOM],

Je suis [ROLE] chez [COMPANY].

[CONTEXTE DE L'INTRODUCTION]

[PROPOSITION/DEMANDE]

Dans l'attente de votre retour,
[SIGNATURE]
```

## Implementation Gmail API

### Configuration OAuth2
```python
# Configuration requise dans Google Cloud Console
# 1. Creer projet
# 2. Activer Gmail API
# 3. Configurer OAuth consent screen
# 4. Creer credentials OAuth 2.0
# 5. Telecharger credentials.json
```

### Lecture Emails (via E2B)
```python
import subprocess
subprocess.run(["pip", "install", "google-auth-oauthlib", "google-api-python-client"], capture_output=True)

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import base64

# Charger credentials (token.json pre-configure)
creds = Credentials.from_authorized_user_file('token.json',
    ['https://www.googleapis.com/auth/gmail.readonly'])

service = build('gmail', 'v1', credentials=creds)

# Recuperer messages
results = service.users().messages().list(
    userId='me',
    maxResults=10,
    q='is:unread'  # Filtres Gmail
).execute()

messages = results.get('messages', [])

for msg in messages:
    # Recuperer details
    message = service.users().messages().get(
        userId='me',
        id=msg['id'],
        format='full'
    ).execute()

    # Parser headers
    headers = {h['name']: h['value'] for h in message['payload']['headers']}
    print(f"From: {headers.get('From')}")
    print(f"Subject: {headers.get('Subject')}")
    print(f"Date: {headers.get('Date')}")
    print("---")
```

### Envoi Email
```python
from email.mime.text import MIMEText
import base64

def create_message(to, subject, body):
    message = MIMEText(body)
    message['to'] = to
    message['subject'] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    return {'raw': raw}

def send_message(service, message):
    return service.users().messages().send(
        userId='me',
        body=message
    ).execute()

# Utilisation
msg = create_message(
    to="destinataire@email.com",
    subject="Test depuis ULTRA-CREATE",
    body="Ceci est un email automatise."
)
send_message(service, msg)
```

## Analyse Intelligente

### Detection Priorite
```yaml
high_priority_signals:
  - "urgent"
  - "ASAP"
  - "deadline"
  - "important"
  - "action required"

spam_signals:
  - "unsubscribe"
  - "promotion"
  - "newsletter"
  - links_ratio > 0.5
```

### Resume Automatique
```javascript
const summarizePrompt = `
Resume cet email en 2-3 phrases:
- Qui envoie
- Sujet principal
- Action requise (si applicable)
- Deadline (si applicable)

Email:
${emailContent}
`
```

## Securite

### Regles
```yaml
security:
  - JAMAIS stocker credentials en clair
  - OAuth2 uniquement (pas de passwords)
  - Confirmation avant envoi bulk
  - Logs de toutes les actions
  - Rate limiting (max 50 emails/heure)
```

### Permissions Requises
```yaml
gmail_scopes:
  readonly: "gmail.readonly"      # Lecture seule
  send: "gmail.send"              # Envoi
  compose: "gmail.compose"        # Brouillons
  modify: "gmail.modify"          # Modification
```

## Output Structure

### read
```markdown
## INBOX SUMMARY

**Non lus**: 5
**Aujourd'hui**: 12
**Urgents**: 2

### Emails Recents

1. **[URGENT]** De: boss@company.com
   Sujet: Deadline projet demain
   Date: Aujourd'hui 14:30

2. De: client@external.com
   Sujet: Question facturation
   Date: Aujourd'hui 10:15

3. De: newsletter@tech.com
   Sujet: Weekly digest
   Date: Hier 18:00
```

### compose (confirmation)
```markdown
## EMAIL COMPOSE

**To**: destinataire@email.com
**Subject**: Suivi projet Alpha

**Preview**:
---
Bonjour,

Je me permets de revenir vers vous concernant le projet Alpha...
---

Confirmer l'envoi? [Envoyer] [Modifier] [Annuler]
```

## MCPs Utilises

| MCP | Usage |
|-----|-------|
| **E2B** | Execution Gmail API |
| **Hindsight** | Historique communications |
| **Memory** | Contacts, contexte |

## Limitations

- Necessite configuration OAuth2 prealable
- Rate limits Gmail API (250 quota units/user/sec)
- Pas de support POP3/IMAP direct
- Attachments limites a 25MB

## Usage

```
/email read --unread
/email compose --to="x@y.com" --subject="Test"
/email search "projet alpha"
/email summarize --since="yesterday"
```

## Metriques

| Metrique | Valeur |
|----------|--------|
| Temps lecture | ~2-5 sec |
| Temps envoi | ~1-2 sec |
| Max emails/requete | 100 |
| Templates | 10+ |

## Version
- Agent: 1.0.0
- Pattern: Automation + LLM Analysis
- Integration: Gmail API, Hindsight
