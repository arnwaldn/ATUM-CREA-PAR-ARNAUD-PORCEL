# MCP Reference Complet - ULTRA-CREATE v27.8

> **54 MCPs configures** dans `.mcp.json`
> Reference exhaustive pour conscience complete du systeme

---

## Index Rapide

| Categorie | MCPs | Statut |
|-----------|------|--------|
| [Core](#core-6-mcps) | 6 | Toujours disponibles |
| [Git/Dev](#gitdev-5-mcps) | 5 | Mixte |
| [Web/Research](#webresearch-5-mcps) | 5 | Requiert API keys |
| [Browser Automation](#browser-automation-3-mcps) | 3 | Mixte |
| [Database](#database-4-mcps) | 4 | Mixte |
| [Design/UI](#designui-4-mcps) | 4 | Toujours disponibles |
| [Cloud/Infra](#cloudinfra-4-mcps) | 4 | Requiert API keys |
| [Payments/Business](#paymentsbusiness-3-mcps) | 3 | Requiert API keys |
| [Automation](#automation-3-mcps) | 3 | Requiert API keys |
| [Communication](#communication-3-mcps) | 3 | Mixte |
| [Desktop](#desktop-3-mcps) | 3 | Toujours disponibles |
| [AI/ML](#aiml-5-mcps) | 5 | Mixte |
| [Documents](#documents-2-mcps) | 2 | Mixte |
| [Storage](#storage-2-mcps) | 2 | Requiert API keys |
| [3D/Games](#3dgames-2-mcps) | 2 | Requiert addons |
| [Mobile](#mobile-1-mcp) | 1 | Requiert SDK |

---

## Core (6 MCPs)

### 1. docker-mcp
| Attribut | Valeur |
|----------|--------|
| **Description** | Gateway Docker Desktop - Acces a 100+ MCPs via Docker |
| **Statut** | Requiert Docker Desktop + MCP Toolkit |
| **Prerequis** | Docker Desktop avec Beta features > MCP Toolkit active |
| **Commande** | `docker mcp gateway run` |

### 2. hindsight
| Attribut | Valeur |
|----------|--------|
| **Description** | Memoire persistante semantique avec 6 banques |
| **Statut** | Actif (requiert script) |
| **Prerequis** | `scripts/start-hindsight.ps1` running sur port 8888 |
| **Capabilities** | `hindsight_recall`, `hindsight_retain`, `hindsight_reflect`, `hindsight_stats` |
| **Banques** | ultra-dev-memory, documents, research, patterns, errors, trading-brain |

### 3. memory
| Attribut | Valeur |
|----------|--------|
| **Description** | Knowledge Graph pour entites et relations |
| **Statut** | Toujours disponible |
| **Package** | `@modelcontextprotocol/server-memory` |
| **Capabilities** | `create_entities`, `create_relations`, `search_nodes`, `read_graph` |

### 4. sequential-thinking
| Attribut | Valeur |
|----------|--------|
| **Description** | Raisonnement structure step-by-step |
| **Statut** | Toujours disponible |
| **Package** | `@modelcontextprotocol/server-sequential-thinking` |
| **Capabilities** | `sequentialthinking` (Chain of Thought) |

### 5. filesystem
| Attribut | Valeur |
|----------|--------|
| **Description** | Operations fichiers sur C:\ |
| **Statut** | Toujours disponible |
| **Package** | `@modelcontextprotocol/server-filesystem` |
| **Acces** | `C:\` (racine) |
| **Capabilities** | `read_file`, `write_file`, `edit_file`, `list_directory`, `search_files` |

### 6. everything
| Attribut | Valeur |
|----------|--------|
| **Description** | Serveur demo Anthropic avec toutes les capabilities |
| **Statut** | Toujours disponible |
| **Package** | `@anthropics/mcp-server-everything` |

---

## Git/Dev (5 MCPs)

### 7. git
| Attribut | Valeur |
|----------|--------|
| **Description** | Operations Git locales |
| **Statut** | Toujours disponible |
| **Package** | `mcp-server-git` (uvx) |
| **Capabilities** | `git_status`, `git_diff`, `git_commit`, `git_log`, `git_branch` |

### 8. github
| Attribut | Valeur |
|----------|--------|
| **Description** | API GitHub complete |
| **Statut** | Actif (API key configuree) |
| **Prerequis** | `GITHUB_TOKEN` dans env |
| **Package** | `@modelcontextprotocol/server-github` |
| **Capabilities** | `search_repositories`, `create_pull_request`, `list_issues`, `get_file_contents` |

### 9. vscode
| Attribut | Valeur |
|----------|--------|
| **Description** | Integration VSCode |
| **Statut** | Requiert VSCode ouvert |
| **Package** | `vscode-mcp-server` |

### 10. prisma
| Attribut | Valeur |
|----------|--------|
| **Description** | ORM Prisma pour databases |
| **Statut** | Requiert `DATABASE_URL` |
| **Prerequis** | Variable `DATABASE_URL` |
| **Package** | `@prisma/mcp-server` |

### 11. semgrep
| Attribut | Valeur |
|----------|--------|
| **Description** | Analyse statique de code |
| **Statut** | Toujours disponible |
| **Package** | `@semgrep/mcp-server` |

---

## Web/Research (5 MCPs)

### 12. fetch
| Attribut | Valeur |
|----------|--------|
| **Description** | HTTP requests simples |
| **Statut** | Toujours disponible |
| **Package** | `mcp-server-fetch` (uvx) |
| **Capabilities** | `fetch` (GET/POST) |

### 13. firecrawl
| Attribut | Valeur |
|----------|--------|
| **Description** | Scraping, search, crawl avance |
| **Statut** | Actif (API key configuree) |
| **Prerequis** | `FIRECRAWL_API_KEY` |
| **Package** | `firecrawl-mcp` |
| **Capabilities** | `firecrawl_scrape`, `firecrawl_search`, `firecrawl_map`, `firecrawl_crawl`, `firecrawl_extract` |

### 14. exa
| Attribut | Valeur |
|----------|--------|
| **Description** | Web search AI avance |
| **Statut** | Actif (API key configuree) |
| **Prerequis** | `EXA_API_KEY` |
| **Package** | `exa-mcp-server` |
| **Capabilities** | `web_search_exa`, `get_code_context_exa` |

### 15. tavily
| Attribut | Valeur |
|----------|--------|
| **Description** | Web search optimise pour AI |
| **Statut** | Requiert API key |
| **Prerequis** | `TAVILY_API_KEY` |
| **Package** | `@tavily/mcp-server` |

### 16. context7
| Attribut | Valeur |
|----------|--------|
| **Description** | Documentation up-to-date des frameworks |
| **Statut** | Toujours disponible |
| **Package** | `@upstash/context7-mcp` |
| **Capabilities** | `resolve-library-id`, `query-docs` |

---

## Browser Automation (3 MCPs)

### 17. puppeteer
| Attribut | Valeur |
|----------|--------|
| **Description** | Automation Chrome |
| **Statut** | Toujours disponible |
| **Package** | `puppeteer-mcp-server` |
| **Capabilities** | `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`, `puppeteer_fill` |

### 18. playwright
| Attribut | Valeur |
|----------|--------|
| **Description** | Automation multi-navigateur |
| **Statut** | Toujours disponible |
| **Package** | `@automatalabs/mcp-server-playwright` |
| **Capabilities** | `browser_navigate`, `browser_screenshot`, `browser_click`, `browser_fill` |

### 19. browserbase
| Attribut | Valeur |
|----------|--------|
| **Description** | Browser cloud sessions |
| **Statut** | Requiert API key |
| **Prerequis** | `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` |
| **Package** | `@browserbase/mcp-server` |

---

## Database (4 MCPs)

### 20. sqlite
| Attribut | Valeur |
|----------|--------|
| **Description** | SQLite local |
| **Statut** | Toujours disponible |
| **Package** | `@modelcontextprotocol/server-sqlite` |
| **Database** | `C:/Claude-Code-Creation/data/local.db` |

### 21. postgres
| Attribut | Valeur |
|----------|--------|
| **Description** | PostgreSQL |
| **Statut** | Requiert DATABASE_URL |
| **Prerequis** | `DATABASE_URL` |
| **Package** | `@modelcontextprotocol/server-postgres` |
| **Capabilities** | `query` (read-only SQL) |

### 22. supabase
| Attribut | Valeur |
|----------|--------|
| **Description** | Supabase complet (auth, DB, storage, edge functions) |
| **Statut** | Actif (token configure) |
| **Prerequis** | `SUPABASE_ACCESS_TOKEN` |
| **Package** | `@supabase/mcp-server-supabase` |
| **Capabilities** | `list_projects`, `execute_sql`, `apply_migration`, `deploy_edge_function` |

### 23. neo4j
| Attribut | Valeur |
|----------|--------|
| **Description** | Graph database |
| **Statut** | Requiert credentials |
| **Prerequis** | `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` |
| **Package** | `@neo4j/mcp-server` |

---

## Design/UI (4 MCPs)

### 24. figma
| Attribut | Valeur |
|----------|--------|
| **Description** | Acces fichiers Figma |
| **Statut** | Toujours disponible |
| **Package** | `figma-mcp` |
| **Capabilities** | `add_figma_file`, `view_node`, `read_comments`, `post_comment` |

### 25. shadcn
| Attribut | Valeur |
|----------|--------|
| **Description** | Composants shadcn/ui |
| **Statut** | Toujours disponible |
| **Package** | `shadcn-ui-mcp-server` |
| **Capabilities** | `list_shadcn_components`, `get_component_details`, `get_component_examples` |

### 26. magic-ui
| Attribut | Valeur |
|----------|--------|
| **Description** | Magic UI components |
| **Statut** | Toujours disponible |
| **Package** | `@21st-dev/magic-mcp` |

### 27. mermaid
| Attribut | Valeur |
|----------|--------|
| **Description** | Generation diagrammes Mermaid |
| **Statut** | Toujours disponible |
| **Package** | `mcp-mermaid` |
| **Capabilities** | `generate_mermaid_diagram` |

---

## Cloud/Infra (4 MCPs)

### 28. cloudflare
| Attribut | Valeur |
|----------|--------|
| **Description** | Cloudflare Workers, R2, KV, Pages |
| **Statut** | Requiert API token |
| **Prerequis** | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| **Package** | `@cloudflare/mcp-server-cloudflare` |

### 29. sentry
| Attribut | Valeur |
|----------|--------|
| **Description** | Error tracking |
| **Statut** | Requiert auth token |
| **Prerequis** | `SENTRY_AUTH_TOKEN` |
| **Package** | `@sentry/mcp-server-sentry` |

### 30. expo
| Attribut | Valeur |
|----------|--------|
| **Description** | React Native / Expo |
| **Statut** | Requiert token |
| **Prerequis** | `EXPO_TOKEN` |
| **Package** | `@expo/mcp-server` |

### 31. posthog
| Attribut | Valeur |
|----------|--------|
| **Description** | Product analytics |
| **Statut** | Requiert API key |
| **Prerequis** | `POSTHOG_API_KEY`, `POSTHOG_HOST` |
| **Package** | `@posthog/mcp-server` |

---

## Payments/Business (3 MCPs)

### 32. stripe
| Attribut | Valeur |
|----------|--------|
| **Description** | Paiements Stripe |
| **Statut** | Requiert secret key |
| **Prerequis** | `STRIPE_SECRET_KEY` |
| **Package** | `@stripe/mcp-server` |

### 33. linear
| Attribut | Valeur |
|----------|--------|
| **Description** | Project management Linear |
| **Statut** | Requiert API key |
| **Prerequis** | `LINEAR_API_KEY` |
| **Package** | `@linear/mcp-server` |

### 34. sanity
| Attribut | Valeur |
|----------|--------|
| **Description** | CMS Sanity |
| **Statut** | Requiert credentials |
| **Prerequis** | `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_TOKEN` |
| **Package** | `@sanity/mcp-server` |

---

## Automation (3 MCPs)

### 35. make
| Attribut | Valeur |
|----------|--------|
| **Description** | Automation Make (ex-Integromat) |
| **Statut** | Requiert API key |
| **Prerequis** | `MAKE_API_KEY` |
| **Package** | `@make/mcp-server` |

### 36. zapier
| Attribut | Valeur |
|----------|--------|
| **Description** | Automation Zapier |
| **Statut** | Requiert API key |
| **Prerequis** | `ZAPIER_API_KEY` |
| **Package** | `@zapier/mcp-server` |

### 37. sonarqube
| Attribut | Valeur |
|----------|--------|
| **Description** | Code quality analysis |
| **Statut** | Requiert credentials |
| **Prerequis** | `SONAR_HOST_URL`, `SONAR_TOKEN` |
| **Package** | `@sonarqube/mcp-server` |

---

## Communication (3 MCPs)

### 38. notion
| Attribut | Valeur |
|----------|--------|
| **Description** | Notion API complete |
| **Statut** | Actif (token configure) |
| **Prerequis** | `NOTION_TOKEN` |
| **Package** | `@notionhq/notion-mcp-server` |
| **Capabilities** | `API-post-search`, `API-retrieve-a-page`, `API-post-page`, `API-query-data-source` |

### 39. resend
| Attribut | Valeur |
|----------|--------|
| **Description** | Email sending |
| **Statut** | Requiert API key |
| **Prerequis** | `RESEND_API_KEY` |
| **Package** | `@resend/mcp-server` |

### 40. youtube
| Attribut | Valeur |
|----------|--------|
| **Description** | Video processing YouTube |
| **Statut** | Toujours disponible |
| **Package** | `zubeid-youtube-mcp-server` |

---

## Desktop (3 MCPs)

### 41. desktop-commander
| Attribut | Valeur |
|----------|--------|
| **Description** | System control avance |
| **Statut** | Toujours disponible |
| **Package** | `@wonderwhy-er/desktop-commander@latest` |
| **Capabilities** | `read_file`, `write_file`, `edit_block`, `start_process`, `list_directory`, `start_search` |

### 42. desktop-automation
| Attribut | Valeur |
|----------|--------|
| **Description** | Mouse/keyboard automation |
| **Statut** | Toujours disponible |
| **Package** | `mcp-desktop-automation` |
| **Capabilities** | `screen_capture`, `mouse_click`, `mouse_move`, `keyboard_type`, `keyboard_press` |

### 43. windows-automation
| Attribut | Valeur |
|----------|--------|
| **Description** | Windows-specific automation |
| **Statut** | Toujours disponible |
| **Package** | `mcp-windows-desktop-automation` |

---

## AI/ML (5 MCPs)

### 44. e2b
| Attribut | Valeur |
|----------|--------|
| **Description** | Code sandbox securise |
| **Statut** | Toujours disponible |
| **Package** | `@e2b/mcp-server` |
| **Capabilities** | `run_code` (Python sandbox) |

### 45. ollama
| Attribut | Valeur |
|----------|--------|
| **Description** | Local LLM avec Ollama |
| **Statut** | Requiert Ollama running |
| **Prerequis** | Ollama sur `localhost:11434` |
| **Package** | `ollama-mcp-server` |

### 46. openai
| Attribut | Valeur |
|----------|--------|
| **Description** | OpenAI API |
| **Statut** | Requiert API key |
| **Prerequis** | `OPENAI_API_KEY` |
| **Package** | `@openai/mcp-server` |

### 47. huggingface
| Attribut | Valeur |
|----------|--------|
| **Description** | HuggingFace models |
| **Statut** | Requiert token |
| **Prerequis** | `HF_TOKEN` |
| **Package** | `@huggingface/mcp-server` |

### 48. replicate
| Attribut | Valeur |
|----------|--------|
| **Description** | Model hosting Replicate |
| **Statut** | Requiert API token |
| **Prerequis** | `REPLICATE_API_TOKEN` |
| **Package** | `mcp-replicate` |

---

## Documents (2 MCPs)

### 49. docling
| Attribut | Valeur |
|----------|--------|
| **Description** | Document parsing avance (IBM Research) |
| **Statut** | Toujours disponible |
| **Package** | `docling-mcp-server` (uvx) |
| **Formats** | PDF, DOCX, PPTX, XLSX, images, HTML |
| **Features** | Preserve tables, formulas LaTeX, structure |

### 50. deepl
| Attribut | Valeur |
|----------|--------|
| **Description** | Traduction DeepL |
| **Statut** | Requiert API key |
| **Prerequis** | `DEEPL_API_KEY` |
| **Package** | `mcp-deepl` |

---

## Storage (2 MCPs)

### 51. upstash
| Attribut | Valeur |
|----------|--------|
| **Description** | Redis/Vector serverless |
| **Statut** | Requiert credentials |
| **Prerequis** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **Package** | `@upstash/mcp-server` |

### 52. browserbase
| Attribut | Valeur |
|----------|--------|
| **Description** | Browser session storage |
| **Statut** | Requiert API key |
| **Prerequis** | `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` |
| **Package** | `@browserbase/mcp-server` |

---

## 3D/Games (2 MCPs)

### 53. blender
| Attribut | Valeur |
|----------|--------|
| **Description** | 3D modeling avec Blender |
| **Statut** | Requiert Blender addon |
| **Prerequis** | Blender avec addon MCP installe |
| **Package** | `blender-mcp` (uvx) |

### 54. unity
| Attribut | Valeur |
|----------|--------|
| **Description** | Unity Editor control |
| **Statut** | Requiert Unity package |
| **Prerequis** | Unity avec package MCP installe |
| **Package** | `mcp-unity` |

---

## Mobile (1 MCP)

### 55. dart-flutter
| Attribut | Valeur |
|----------|--------|
| **Description** | Official Dart/Flutter MCP |
| **Statut** | Requiert Dart SDK |
| **Prerequis** | `dart pub global activate dart_mcp_server` |
| **Commande** | `dart run dart_mcp_server` |

---

## Resume par Statut

### Toujours Disponibles (21)
```
memory, sequential-thinking, filesystem, everything, git, semgrep,
fetch, context7, puppeteer, playwright, sqlite, figma, shadcn,
magic-ui, mermaid, youtube, desktop-commander, desktop-automation,
windows-automation, e2b, docling
```

### Actifs (API keys configurees) (6)
```
github, firecrawl, exa, supabase, notion, hindsight
```

### Requierent Configuration (27)
```
docker-mcp, vscode, prisma, tavily, browserbase, postgres, neo4j,
cloudflare, sentry, expo, posthog, stripe, linear, sanity,
make, zapier, sonarqube, resend, ollama, openai, huggingface,
replicate, deepl, upstash, blender, unity, dart-flutter
```

---

## Usage dans ULTRA-CREATE

### Auto-Selection par Intent
Les MCPs sont auto-selectionnes par le hook `mcp-auto-router.js` selon l'intent detecte.

### Profiles MCP
Voir `config/mcp-profiles.json` pour les groupements par type de projet.

### Fallback Chain
Voir `config/mcp-fallback.json` pour les alternatives quand un MCP n'est pas disponible.

---

*ULTRA-CREATE v27.8 | 54 MCPs Configures | Reference Complete*
