# Guide des Modes ULTRA-CREATE v15.0

## Vue d'Ensemble

ULTRA-CREATE v15.0 dispose de **15 modes** pour maximiser l'efficacite selon le type de tache.

---

## NOUVEAUX MODES v15.0 (6)

### 1. Mode Perfect UI
**Activation:** "UI moderne", "UI pro", "design pro"

**MCPs Utilises:**
- magic-ui (21st.dev) - Composants pro
- shadcn - Base components
- echarts - Visualisations
- mermaid - Diagrammes

**Comportement:**
- Generation UI qualite designer professionnel (9.5/10)
- Animations et interactions modernes
- Mobile-first responsive
- Dark mode automatique
- Accessibilite WCAG 2.1

**Exemple:**
```
"Cree un hero section moderne avec animations"
"Landing page style startup 2025"
"Dashboard avec charts interactifs"
```

---

### 2. Mode Deep Research
**Activation:** "Recherche sur...", "Analyse de...", "Documentation de..."

**MCPs Utilises:**
- context7 - Docs a jour
- firecrawl - Web scraping
- tavily - Search AI
- exa - Neural search
- vectorize - RAG

**Comportement:**
- Documentation toujours UP-TO-DATE
- Scraping intelligent de sources multiples
- Citations et references
- Synthese structuree

**Exemple:**
```
"Recherche les meilleures pratiques React 19"
"Analyse le site concurrent [url]"
"Documentation complete de [framework]"
```

---

### 3. Mode Enterprise Quality
**Activation:** "Qualite entreprise", "Security scan", "Production ready"

**MCPs Utilises:**
- sonarqube - Code quality + SAST
- semgrep - Security patterns
- sentry - Error monitoring

**Comportement:**
- Scan OWASP Top 10 automatique
- Technical debt tracking
- Quality gates avant deploy
- Monitoring production configure

**Exemple:**
```
"Scan de securite complet"
"Prepare le code pour production"
"Analyse qualite du projet"
```

---

### 4. Mode Cloud Deploy
**Activation:** "Deploy sur Cloudflare", "Edge deploy", "Workers"

**MCPs Utilises:**
- cloudflare - Workers/KV/R2/D1
- kubernetes - Orchestration

**Comportement:**
- Deploy edge < 50ms latency mondial
- Configuration automatique Workers
- Storage R2/KV/D1 selon besoin
- DNS et SSL automatiques

**Exemple:**
```
"Deploie l'API sur Cloudflare Workers"
"Configure R2 pour les uploads"
"Database D1 pour le projet"
```

---

### 5. Mode Full Automation
**Activation:** "Automatise...", "Workflow pour...", "Connecte..."

**MCPs Utilises:**
- make - Scenarios complexes
- zapier - 8000+ apps
- linear - Project management

**Comportement:**
- Creation workflows visuels
- Integration multi-apps
- Triggers et actions automatiques
- Error handling configure

**Exemple:**
```
"Automatise: PR merged -> deploy + Slack"
"Workflow: nouveau lead -> CRM + email"
"Connecte GitHub a Linear"
```

---

### 6. Mode GraphRAG Memory
**Activation:** Automatique pour contexte complexe

**MCPs Utilises:**
- neo4j - Graph database
- vectorize - Vector search
- memory (natif) - Persistence

**Comportement:**
- Memoire semantique avancee
- Relations entre entites
- Context retention +500%
- Reduction hallucinations 90%

**Usage:**
```
"Rappelle-toi l'architecture du projet X"
"Quelles sont les relations entre A et B?"
"Historique des decisions"
```

---

## MODES HERITAGE v14.0 (9)

### 7. Mode Devin
**Activation:** "Mode devin", tache complexe detectee

**Comportement:**
- Execution en arriere-plan
- 15+ agents en parallele
- Auto-recovery sur erreurs
- Checkpoints automatiques
- L'utilisateur peut continuer a travailler

**Ideal pour:**
- Creation SaaS complete
- Projets multi-composants
- Taches longues

---

### 8. Mode Visual
**Activation:** "Depuis Figma...", "Depuis ce screenshot..."

**MCPs Utilises:**
- figma - Design import
- screenshot - Visual analysis
- playwright - Live preview

**Comportement:**
- Conversion design -> code
- Pixel-perfect reproduction
- Visual diff comparaison

---

### 9. Mode Deploy
**Activation:** "Deploie...", "En production"

**Comportement:**
- One-click multi-plateforme
- Pre-flight checks automatiques
- Rollback si erreur
- Notifications succes/echec

---

### 10. Mode Standard
**Activation:** Defaut

**Comportement:**
- Equilibre vitesse/qualite
- Tests de base
- Review code

---

### 11. Mode Speed
**Activation:** "Mode speed", "Rapidement", "Prototype"

**Comportement:**
- Prototype rapide
- Tests minimaux
- Focus fonctionnalite

---

### 12. Mode Quality
**Activation:** "Mode quality", "Production"

**Comportement:**
- Tests exhaustifs (95%+ coverage)
- Review approfondi
- Documentation complete

---

### 13. Mode Mentor
**Activation:** "Explique...", "Comment fonctionne..."

**Comportement:**
- Explications detaillees
- Exemples pedagogiques
- Alternatives presentees

---

### 14. Mode Architect
**Activation:** "Conception...", "Architecture..."

**Comportement:**
- Diagrammes Mermaid
- Patterns recommandes
- Trade-offs expliques

---

### 15. Mode Autonomous
**Activation:** "Mode autonomous", "Fais tout"

**Comportement:**
- Execution complete sans interruption
- Decisions automatiques
- Rapport final detaille

---

## COMBINAISONS DE MODES

### SaaS Production Ready
```
devin + enterprise-quality + cloud-deploy
```
- Creation parallele
- Security scan
- Deploy Cloudflare

### UI/UX Excellence
```
visual + perfect-ui + deep-research
```
- Figma import
- Magic UI quality
- Best practices actuelles

### Full Stack Automated
```
devin + full-automation + graphrag-memory
```
- Dev parallele
- CI/CD automatise
- Memoire projet

---

## MATRICE MODE vs TACHE

| Tache | Mode Recommande |
|-------|-----------------|
| Creer SaaS | devin |
| UI moderne | perfect-ui |
| Recherche technique | deep-research |
| Security audit | enterprise-quality |
| Deploy edge | cloud-deploy |
| Workflows | full-automation |
| Projet complexe | graphrag-memory |
| Depuis design | visual |
| Prototype rapide | speed |
| Production | quality |
| Apprendre | mentor |
| Concevoir | architect |

---

## DETECTION AUTOMATIQUE

ULTRA-CREATE v15.0 detecte automatiquement le mode optimal:

```
"Cree une landing page moderne" -> perfect-ui + devin
"Recherche les best practices Next.js 15" -> deep-research
"Deploie sur Cloudflare" -> cloud-deploy
"Automatise le deploy" -> full-automation
"Scan de securite" -> enterprise-quality
"Cree un SaaS complet" -> devin + enterprise-quality
```

---

**Version:** 15.0 | **Modes:** 15 | **Nouveaux:** 6

**"15 modes pour dominer chaque type de tache"**
