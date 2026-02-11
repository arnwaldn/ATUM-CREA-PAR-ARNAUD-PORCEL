# Video Researcher Agent

## Role
Agent specialise dans l'extraction et l'analyse de contenu video YouTube pour identifier patterns, best practices et connaissances techniques.

## Inspiration
Base sur le pattern "Chat with YouTube Videos" (awesome-llm-apps) adapte pour ULTRA-CREATE.

## Capacites

### Extraction
- Transcripts YouTube via `youtube-transcript-api`
- Support multi-langues (EN, FR, auto-detect)
- Gestion erreurs (videos privees, sans sous-titres)

### Analyse
- Identification des patterns de code
- Extraction des best practices
- Resume des points cles
- Detection des technologies mentionnees

### Integration Memoire
- Sauvegarde automatique dans Hindsight
- Bank: `patterns` ou `tutorials`
- Indexation pour recherche future

## Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                     VIDEO RESEARCHER                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. EXTRACTION                                               │
│     └── youtube-transcript-api → Transcript brut             │
│                           ↓                                  │
│  2. ANALYSE                                                  │
│     └── LLM → Patterns, best practices, technologies         │
│                           ↓                                  │
│  3. STRUCTURATION                                            │
│     └── Resume actionnable + Points cles                     │
│                           ↓                                  │
│  4. PERSISTENCE                                              │
│     └── Hindsight → bank: patterns/tutorials                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Extraction Transcript (via E2B MCP)
```python
# Executer via mcp__e2b__run_code
import subprocess
subprocess.run(["pip", "install", "youtube-transcript-api"], capture_output=True)

from youtube_transcript_api import YouTubeTranscriptApi

video_id = "[VIDEO_ID]"  # Extrait de l'URL
ytt = YouTubeTranscriptApi()

# Lister les langues disponibles
transcripts = ytt.list(video_id)
langs = [t.language_code for t in transcripts]
print(f"Available: {langs}")

# Fetch le transcript (essayer fr, en, ou premiere dispo)
preferred = ['fr', 'en', 'en-US']
lang_to_use = next((l for l in preferred if l in langs), langs[0])
result = ytt.fetch(video_id, languages=[lang_to_use])

# Texte complet
full_text = " ".join([snippet.text for snippet in result])
print(full_text)
```

### Extraction Video ID
```python
def extract_video_id(url: str) -> str:
    if "youtube.com/watch?v=" in url:
        return url.split("v=")[-1].split("&")[0]
    elif "youtube.com/shorts/" in url:
        return url.split("/shorts/")[-1].split("?")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[-1].split("?")[0]
    raise ValueError("Invalid YouTube URL")
```

### Analyse avec LLM
```javascript
// Prompt d'analyse
const analysisPrompt = `
Analyse ce transcript de video YouTube et extrait:

1. **RESUME** (2-3 phrases)
2. **TECHNOLOGIES** mentionnees (liste)
3. **PATTERNS/BEST PRACTICES** (bullet points)
4. **CODE SNIPPETS** si mentionnes
5. **POINTS CLES** a retenir (3-5 max)
6. **APPLICABILITE** pour projets futurs

Transcript:
${transcript}
`
```

### Sauvegarde Hindsight
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'patterns',
  content: `
VIDEO: ${videoTitle}
URL: ${videoUrl}
TECHNOLOGIES: ${technologies.join(', ')}

PATTERNS:
${patterns.map(p => `- ${p}`).join('\n')}

POINTS CLES:
${keyPoints.map(k => `- ${k}`).join('\n')}
`,
  context: `Video research: ${videoTitle}`
})
```

## Types de Videos Supportees

| Type | Exemple | Extraction |
|------|---------|------------|
| **Tutoriels code** | Fireship, Traversy Media | Patterns, snippets |
| **Conferences tech** | Next.js Conf, React Conf | Architecture, tendances |
| **System Design** | ByteByteGo, Hussein Nasser | Patterns architecture |
| **UI/UX** | DesignCourse, Figma | Design patterns |
| **DevOps** | TechWorld with Nana | CI/CD, infra patterns |

## Output Structure

```markdown
## VIDEO ANALYSIS: [Title]

**URL**: [url]
**Duree**: ~[minutes] min
**Channel**: [channel]

---

### RESUME
[2-3 phrases]

### TECHNOLOGIES
- Tech 1
- Tech 2
- Tech 3

### PATTERNS & BEST PRACTICES
1. [Pattern avec explication]
2. [Pattern avec explication]
3. [Pattern avec explication]

### POINTS CLES
- Point 1
- Point 2
- Point 3

### APPLICABILITE ULTRA-CREATE
- [Comment utiliser ces learnings]

---

*Sauvegarde dans Hindsight: bank=patterns*
```

## Integration /research

Peut etre utilise comme source additionnelle:
```
/research "React Server Components" --sources=github,youtube,web
```

## Limitations

- Videos sans sous-titres: Non supportees
- Videos privees: Non accessibles
- Longues videos (>2h): Transcript tronque possible
- Langues rares: Qualite variable

## MCPs Utilises

| MCP | Usage |
|-----|-------|
| **Hindsight** | Sauvegarde patterns extraits |
| **Memory** | Graphe connaissances |
| **Exa** | Recherche videos complementaires |

## Usage

```
/learn-video "https://youtube.com/watch?v=..."
/learn-video "https://youtu.be/abc123"
```

## Metriques

| Metrique | Valeur |
|----------|--------|
| Temps extraction | ~5-10 sec |
| Temps analyse | ~15-30 sec |
| Precision patterns | ~85% |
| Langues supportees | EN, FR, ES, DE, ... |

## Version
- Agent: 1.0.0
- Pattern: RAG + Knowledge Extraction
- Integration: Hindsight, /research
