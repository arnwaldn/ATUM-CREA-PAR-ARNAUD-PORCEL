---
description: Apprendre depuis YouTube (tutoriels, conferences) (user)
---

# /learn-video - YouTube Learning

## USAGE
```
/learn-video "https://youtube.com/watch?v=abc123"
/learn-video "https://youtu.be/xyz789" --focus="architecture"
/learn-video "youtube-url" --timestamps
```

## DESCRIPTION
Extraire et analyser le contenu de videos YouTube
pour apprendre des tutoriels, conferences, et presentations.

## WORKFLOW

### 1. Extraction transcript
```javascript
// Utiliser Firecrawl ou fetch pour obtenir le transcript
mcp__firecrawl__firecrawl_scrape({
  url: youtubeUrl,
  formats: ['markdown']
})
```

### 2. Analyse contenu
Identifier:
- Type de video (tutorial, conference, demo, etc.)
- Sujets principaux
- Points cles par section
- Code mentionne
- Resources citees

### 3. Structure par timestamps
```yaml
video_analysis:
  title: "Video Title"
  channel: "Channel Name"
  duration: "45:30"
  type: tutorial

  sections:
    - timestamp: "0:00"
      title: "Introduction"
      summary: "..."

    - timestamp: "5:30"
      title: "Setup"
      summary: "..."
      code: |
        npm install ...

    - timestamp: "15:00"
      title: "Implementation"
      key_points:
        - point1
        - point2
      code: |
        // main implementation
```

### 4. Extraction patterns
Si tutorial technique:
- Patterns de code
- Best practices mentionnees
- Libraries/tools utilises
- Erreurs courantes evitees

### 5. Sauvegarde Hindsight
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'research',
  content: `
## Video: ${title}
### URL: ${url}
### Type: ${type}

### Points Cles
${keyPoints}

### Code Patterns
${codePatterns}

### Resources Mentionnees
${resources}

### Takeaways
${takeaways}
`,
  context: `YouTube learning: ${title}`
})
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --focus="X" | Concentrer sur aspect |
| --timestamps | Inclure tous les timestamps |
| --code-only | Extraire uniquement le code |
| --summary | Resume court uniquement |

## TYPES DE VIDEOS SUPPORTEES
- Tutoriels techniques (coding, setup)
- Conferences (talks, keynotes)
- System Design interviews
- Product demos
- Cours en ligne

## OUTPUT EXEMPLE

```yaml
learned:
  source: "YouTube - Build a SaaS in 1 Hour"
  type: tutorial
  stack: [Next.js, Supabase, Stripe]

  patterns:
    - name: "Auth flow"
      description: "Supabase Auth avec middleware"
      code: "middleware.ts pattern"

    - name: "Stripe integration"
      description: "Webhooks + customer portal"

  best_practices:
    - "Server components pour queries DB"
    - "Client components uniquement pour interactivite"

  tools_mentioned:
    - shadcn/ui
    - Vercel
    - Supabase Studio

  saved_to: research bank
```

## MCP UTILISES
- Firecrawl (scraping transcript)
- Hindsight (sauvegarde research)
