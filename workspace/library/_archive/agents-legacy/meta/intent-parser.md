# Intent Parser v2.0 - Natural Language Mode

> **Role**: Parser TOUTE demande en langage naturel et déterminer l'action appropriée avec un score de confiance.

## Évolution v1.0 → v2.0

| Aspect | v1.0 | v2.0 |
|--------|------|------|
| Input | Commandes slash | Langage naturel |
| Detection | Pattern matching | NLP + Keywords |
| Output | Action directe | Action + Confidence |
| Fallback | Erreur | Wizard interactif |

---

## Catégories d'Intent

| Intent | Description | Seuil Confiance | Action si < seuil |
|--------|-------------|-----------------|-------------------|
| `CREATE` | Créer un nouveau projet | 70% | Wizard création |
| `MODIFY` | Modifier code existant | 70% | Questions ciblées |
| `DEBUG` | Résoudre erreur/bug | 60% | Wizard debug |
| `DEPLOY` | Déployer projet | 80% | Wizard deploy |
| `EXPLAIN` | Expliquer code/concept | 50% | Réponse directe |
| `EXPLORE` | Naviguer codebase | 50% | Réponse directe |
| `RESEARCH` | Recherche information | 60% | Recherche + réponse |

---

## Algorithme de Détection

### 1. Extraction Keywords

```javascript
function extractKeywords(message) {
  const normalized = message.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");  // Accents

  return {
    verbs: extractVerbs(normalized),      // créer, faire, ajouter...
    nouns: extractNouns(normalized),      // site, jeu, app...
    adjectives: extractAdjectives(normalized),  // simple, rapide...
    technicalTerms: extractTech(normalized),    // react, supabase...
    numbers: extractNumbers(normalized),  // chiffres, quantités
    sentiment: detectSentiment(normalized)  // problème, erreur, aide
  };
}
```

### 2. Calcul Intent Score

```javascript
function calculateIntentScore(keywords) {
  const scores = {
    CREATE: 0,
    MODIFY: 0,
    DEBUG: 0,
    DEPLOY: 0,
    EXPLAIN: 0,
    EXPLORE: 0,
    RESEARCH: 0
  };

  // CREATE indicators
  const createVerbs = ['creer', 'faire', 'generer', 'construire', 'developper', 'lancer'];
  const createNouns = ['site', 'app', 'jeu', 'projet', 'saas', 'landing'];
  scores.CREATE += matchScore(keywords.verbs, createVerbs) * 40;
  scores.CREATE += matchScore(keywords.nouns, createNouns) * 30;

  // MODIFY indicators
  const modifyVerbs = ['ajouter', 'modifier', 'changer', 'mettre', 'update'];
  scores.MODIFY += matchScore(keywords.verbs, modifyVerbs) * 40;
  scores.MODIFY += keywords.technicalTerms.length > 0 ? 20 : 0;

  // DEBUG indicators
  const debugWords = ['erreur', 'bug', 'probleme', 'marche pas', 'crash', 'fix'];
  scores.DEBUG += matchScore([...keywords.nouns, ...keywords.verbs], debugWords) * 50;
  scores.DEBUG += keywords.sentiment === 'negative' ? 30 : 0;

  // DEPLOY indicators
  const deployWords = ['deployer', 'deploy', 'mettre en ligne', 'production', 'heberger', 'installer', 'installation', 'configurer', 'serveur'];
  const deployAdvancedWords = ['multi-arch', 'arm', 'raspberry', 'pgvector', 'ubuntu', 'debian', 'wkhtmltopdf', 'nginx', 'systemd', 'docker'];
  scores.DEPLOY += matchScore(keywords.verbs, deployWords) * 60;
  scores.DEPLOY += matchScore(keywords.nouns, deployAdvancedWords) * 30;

  // EXPLAIN indicators
  const explainWords = ['expliquer', 'comment', 'pourquoi', 'cest quoi', 'quest-ce'];
  scores.EXPLAIN += matchScore(keywords.verbs, explainWords) * 50;

  // EXPLORE indicators
  const exploreWords = ['montrer', 'voir', 'liste', 'fichiers', 'structure'];
  scores.EXPLORE += matchScore(keywords.verbs, exploreWords) * 40;

  // RESEARCH indicators
  const researchWords = ['chercher', 'recherche', 'trouver', 'documentation'];
  scores.RESEARCH += matchScore(keywords.verbs, researchWords) * 40;

  // OPTIMIZE indicators (web-vitals, performance)
  const optimizeWords = ['optimiser', 'performance', 'vitals', 'web-vitals', 'lent', 'rapide', 'accelerer'];
  const metricsWords = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB', 'Core Web Vitals', 'lighthouse', 'metrics'];
  scores.MODIFY += matchScore([...keywords.verbs, ...keywords.nouns], optimizeWords) * 35;
  scores.MODIFY += matchScore(keywords.technicalTerms, metricsWords) * 40;
  // Note: Route vers agents/specialized/performance-optimizer.md si optimizeWords détecté

  return scores;
}
```

### 3. Sélection Intent Principal

```javascript
function selectIntent(scores) {
  const maxScore = Math.max(...Object.values(scores));
  const intent = Object.entries(scores).find(([k, v]) => v === maxScore)[0];

  const confidence = maxScore / 100;  // Normalize to 0-1

  return {
    intent,
    confidence,
    needsWizard: confidence < getThreshold(intent),
    alternativeIntents: getAlternatives(scores, intent)
  };
}

function getThreshold(intent) {
  const thresholds = {
    CREATE: 0.70,
    MODIFY: 0.70,
    DEBUG: 0.60,
    DEPLOY: 0.80,
    EXPLAIN: 0.50,
    EXPLORE: 0.50,
    RESEARCH: 0.60
  };
  return thresholds[intent];
}
```

---

## Mapping Mots-Clés → Templates

### Projets Web

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| restaurant, menu, reservation | `restaurant` | - | +20% |
| saas, abonnement, stripe, auth | `saas` | - | +25% |
| supabase native, supabase auth, rls, row level security, mfa supabase, supabase ssr | `supabase-native` | fullstack-super | +30% |
| landing, marketing, page | `landing` | - | +20% |
| boutique, ecommerce, produits | `ecommerce` | - | +20% |
| blog, articles, posts | `blog` | - | +20% |
| portfolio, cv, projets perso | `portfolio` | - | +20% |
| dashboard, admin, analytics | `admin-dashboard` | - | +20% |
| pwa, offline, installable, service worker | `pwa` | - | +25% |
| chat, temps réel, websocket, realtime | `websocket-chat` | - | +25% |
| graphql, federation, schema | `api` | graphql-expert | +25% |

### Jeux

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| tetris, 2048, puzzle, match | `game-puzzle` | phaser-expert | +30% |
| roguelike, dungeon, procedural | `game-roguelike` | procgen-expert | +25% |
| multiplayer, online, pvp | `game-multiplayer` | networking-expert | +25% |
| 3d, racing, fps | `game-3d-web` | threejs-expert | +25% |
| unity, vr, ar, console | `unity-game` | unity-expert | +30% |
| godot, gdscript, indie | godot project | godot-expert | +25% |

### Applications

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| mobile, ios, android | `mobile` | expo-specialist | +25% |
| desktop, windows, mac | `desktop` | tauri-specialist | +25% |
| extension, chrome, browser | `chrome-extension` | - | +25% |
| bot, discord, serveur | `discord-bot` | - | +25% |
| api, backend, rest | `api` | - | +20% |

### Web3 / Blockchain

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| blockchain, web3, crypto | custom | blockchain-expert | +30% |
| smart contract, solidity, ethereum | custom | blockchain-expert | +30% |
| nft, erc721, collection | custom | blockchain-expert | +30% |
| defi, staking, swap, yield | custom | blockchain-expert | +30% |
| dapp, wallet, metamask | custom | blockchain-expert | +30% |
| token, erc20, airdrop | custom | blockchain-expert | +25% |

### ML/AI (Phase 2A)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| pytorch, deep learning, neural network, training | `ml-pipeline` | pytorch-expert | +30% |
| tensorflow, keras, tf, tflite | `ml-pipeline` | tensorflow-expert | +30% |
| mlops, model deployment, kubeflow, mlflow | `ml-pipeline` | mlops-engineer | +25% |
| llm, chatbot, claude api, gpt api | `ai-assistant` | llm-integration-expert | +30% |
| embeddings, rag, vector database | `ai-assistant` | llm-integration-expert | +25% |
| machine learning, ml, data science | `ml-pipeline` | pytorch-expert | +20% |
| computer vision, image classification | `ml-pipeline` | pytorch-expert | +25% |
| nlp, text analysis, sentiment | `ml-pipeline` | pytorch-expert | +25% |

### Mobile Native (Phase 2B)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| swift, ios natif, swiftui, uikit | `ios-native` | swift-ios-expert | +30% |
| iphone, ipad, app store, xcode | `ios-native` | swift-ios-expert | +25% |
| kotlin, android natif, jetpack compose | `android-native` | kotlin-android-expert | +30% |
| google play, android studio, material 3 | `android-native` | kotlin-android-expert | +25% |
| ios et android natif | both | swift-ios + kotlin-android | +35% |

### Flutter/Dart Cross-Platform (Phase 2B+)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| flutter, dart, flutter app | `mobile` | flutter-dart-expert | +35% |
| riverpod, flutter_riverpod, provider | `mobile` | flutter-dart-expert | +30% |
| go_router, flutter navigation, routing flutter | `mobile` | flutter-dart-expert | +30% |
| freezed, dart data class, code generation | `mobile` | flutter-dart-expert | +25% |
| drift, floor, sqlite flutter | `mobile` | flutter-dart-expert | +25% |
| widget, stateless, stateful, buildcontext | `mobile` | flutter-dart-expert | +30% |
| pubspec, pubspec.yaml, flutter pub | `mobile` | flutter-dart-expert | +25% |
| flutter_bloc, bloc pattern, cubit | `mobile` | flutter-dart-expert | +30% |
| getx, get_it, dependency injection dart | `mobile` | flutter-dart-expert | +25% |
| hive, isar, objectbox, flutter storage | `mobile` | flutter-dart-expert | +25% |
| flutter web, flutter desktop, multiplatform | `mobile` | flutter-dart-expert | +35% |
| material 3 flutter, cupertino widgets | `mobile` | flutter-dart-expert | +25% |
| dio, http flutter, retrofit dart | `mobile` | flutter-dart-expert | +25% |
| flutter test, widget testing, integration test dart | `mobile` | flutter-dart-expert | +25% |
| flutter ios android, cross-platform mobile | `mobile` | flutter-dart-expert | +35% |

### XR/Immersif (Phase 2C)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| vr, virtual reality, realite virtuelle | `webxr-experience` | webxr-expert | +30% |
| ar, augmented reality, realite augmentee | `webxr-experience` | webxr-expert | +30% |
| webxr, a-frame, aframe | `webxr-experience` | webxr-expert | +35% |
| oculus, meta quest, headset | `webxr-experience` | webxr-expert | +25% |
| 360, immersif, 3dof, 6dof | `webxr-experience` | webxr-expert | +25% |
| hand tracking, controllers vr | `webxr-experience` | webxr-expert | +30% |

### AI Agents - Starter

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| blog to podcast, article audio, text to speech | `ai-blog-to-podcast` | llm-integration-expert | +30% |
| data analysis, analyze data, csv analysis | `ai-data-analysis` | pytorch-expert | +30% |
| data visualization, charts, graphs, plots | `ai-data-visualization` | pytorch-expert | +30% |
| medical imaging, xray, scan, radiology | `ai-medical-imaging` | pytorch-expert | +35% |
| meme generator, memes, funny images | `ai-meme-generator` | llm-integration-expert | +25% |
| music generator, compose music, audio generation | `ai-music-generator` | llm-integration-expert | +30% |
| travel agent, trip planner, vacation | `ai-travel-agent` | llm-integration-expert | +30% |
| research agent, web research, gather info | `openai-research-agent` | llm-integration-expert | +30% |
| web scraping, scraper, extract data | `web-scraping-agent` | llm-integration-expert | +30% |
| finance agent, stock analysis, xai | `xai-finance-agent` | llm-integration-expert | +30% |
| mixture of agents, multi-model, ensemble | `mixture-of-agents` | llm-integration-expert | +35% |
| multimodal agent, vision + text, image understanding | `multimodal-ai-agent` | llm-integration-expert | +30% |
| reasoning agent, think step by step, chain of thought | `ai-reasoning-agent` | llm-integration-expert | +30% |
| startup trends, market analysis, trend analysis | `ai-startup-trend-analysis` | llm-integration-expert | +25% |
| life insurance, insurance advisor | `ai-life-insurance-advisor` | llm-integration-expert | +25% |
| breakup recovery, emotional support, therapy bot | `ai-breakup-recovery` | llm-integration-expert | +25% |

### AI Agents - Advanced Single

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| consultant, business advice, consulting | `ai-consultant` | llm-integration-expert | +30% |
| customer support, help desk, support bot | `ai-customer-support` | llm-integration-expert | +30% |
| deep research, thorough research, comprehensive | `ai-deep-research` | llm-integration-expert | +35% |
| email outreach, gtm, sales email | `ai-email-gtm` | llm-integration-expert | +25% |
| health fitness, workout, nutrition | `ai-health-fitness` | llm-integration-expert | +30% |
| investment, portfolio, stocks, trading | `ai-investment` | llm-integration-expert | +30% |
| journalist, news writing, article writing | `ai-journalist` | llm-integration-expert | +30% |
| meeting agent, meeting notes, transcription | `ai-meeting` | llm-integration-expert | +30% |
| movie production, film, screenplay | `ai-movie-production` | llm-integration-expert | +30% |
| personal finance, budget, expenses | `ai-personal-finance` | llm-integration-expert | +30% |
| recipe, meal planning, cooking | `ai-recipe-meal-planning` | llm-integration-expert | +30% |
| startup insight, business analysis | `ai-startup-insight` | llm-integration-expert | +25% |
| system architect, architecture design | `ai-system-architect` | llm-integration-expert | +35% |
| windows automation, desktop automation | `windows-autonomous-agent` | llm-integration-expert | +30% |

### AI Agents - Advanced Multi-Agent

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| air quality, aqi, pollution analysis | `ai-aqi-analysis` | llm-integration-expert | +25% |
| domain research, industry research | `ai-domain-research` | llm-integration-expert | +30% |
| financial coach, money advice | `ai-financial-coach` | llm-integration-expert | +30% |
| home renovation, interior design ai | `ai-home-renovation` | llm-integration-expert | +30% |
| mental wellbeing, mental health, therapy | `ai-mental-wellbeing` | llm-integration-expert | +30% |
| news podcast, social media news | `ai-news-podcast` | llm-integration-expert | +30% |
| self evolving, adaptive agent, learning agent | `ai-self-evolving` | llm-integration-expert | +35% |
| speech trainer, public speaking, presentation | `ai-speech-trainer` | llm-integration-expert | +30% |
| multi agent researcher, collaborative research | `multi-agent-researcher` | llm-integration-expert | +35% |
| product launch, go to market, launch intel | `product-launch-intel` | llm-integration-expert | +30% |

### Agent Teams (Multi-Agent Systems)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| competitor intelligence, competitive analysis | `team-competitor-intel` | llm-integration-expert | +35% |
| finance team, financial analysis team | `team-finance` | llm-integration-expert | +35% |
| game design team, game development team | `team-game-design` | llm-integration-expert | +35% |
| legal team, legal analysis, contract review | `team-legal` | llm-integration-expert | +35% |
| real estate team, property analysis | `team-real-estate` | llm-integration-expert | +35% |
| recruitment team, hiring, talent acquisition | `team-recruitment` | llm-integration-expert | +35% |
| seo audit, seo team, search optimization | `team-seo-audit` | llm-integration-expert | +30% |
| services agency, agency team, crewai | `team-services-agency` | llm-integration-expert | +35% |
| teaching team, education team, tutoring | `team-teaching` | llm-integration-expert | +35% |
| travel planner team, vacation planning | `team-travel-planner` | llm-integration-expert | +35% |
| coding team, development team, code review | `team-coding` | llm-integration-expert | +35% |
| design team, creative team, visual design | `team-design` | llm-integration-expert | +35% |
| uiux feedback, design critique, ui review | `team-uiux-feedback` | llm-integration-expert | +35% |

### Game Playing AI

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| pygame 3d, 3d game ai, game playing | `ai-3d-pygame` | llm-integration-expert | +30% |
| chess ai, chess bot, play chess | `ai-chess` | llm-integration-expert | +30% |
| tic tac toe, morpion, noughts crosses | `ai-tic-tac-toe` | llm-integration-expert | +25% |

### RAG Systems

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| rag gemma, agentic rag, gemma embeddings | `rag-agentic-gemma` | llm-integration-expert | +35% |
| rag gpt5, o1 rag, reasoning rag | `rag-agentic-gpt5` | llm-integration-expert | +35% |
| math rag, mathematical reasoning | `rag-agentic-math` | llm-integration-expert | +30% |
| rag reasoning, think before answer | `rag-agentic-reasoning` | llm-integration-expert | +35% |
| blog search, article search | `rag-blog-search` | llm-integration-expert | +25% |
| autonomous rag, self-improving rag | `rag-autonomous` | llm-integration-expert | +35% |
| contextual rag, context-aware | `rag-contextual` | llm-integration-expert | +30% |
| corrective rag, crag, self-correcting | `rag-corrective` | llm-integration-expert | +35% |
| deepseek rag, local deepseek | `rag-deepseek-local` | llm-integration-expert | +30% |
| gemini rag, google rag | `rag-gemini` | llm-integration-expert | +30% |
| hybrid search, semantic + keyword | `rag-hybrid-search` | llm-integration-expert | +30% |
| llama rag, local llama | `rag-llama-local` | llm-integration-expert | +30% |
| local hybrid, local search | `rag-local-hybrid` | llm-integration-expert | +30% |
| local rag agent, offline rag | `rag-local-agent` | llm-integration-expert | +30% |
| qwen rag, qwen local | `rag-qwen-local` | llm-integration-expert | +30% |
| rag as service, rag api, raas | `rag-as-service` | llm-integration-expert | +35% |
| cohere rag, cohere rerank | `rag-cohere` | llm-integration-expert | +30% |
| rag chain, basic rag, simple rag | `rag-chain` | llm-integration-expert | +25% |
| database routing, multi-db rag | `rag-db-routing` | llm-integration-expert | +30% |
| vision rag, image rag, multimodal rag | `rag-vision` | llm-integration-expert | +35% |

### MCP AI Agents

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| mcp travel, travel mcp, mcp vacation | `mcp-travel-planner` | llm-integration-expert | +35% |
| mcp browser, browser mcp, web automation mcp | `mcp-browser` | llm-integration-expert | +35% |
| mcp github, github mcp, repo mcp | `mcp-github` | llm-integration-expert | +35% |
| multi mcp, multiple mcp, mcp orchestration | `mcp-multi` | llm-integration-expert | +35% |
| mcp notion, notion mcp, workspace mcp | `mcp-notion` | llm-integration-expert | +35% |

### Voice AI Agents

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| audio tour, museum guide, voice guide | `voice-audio-tour` | llm-integration-expert | +35% |
| voice support, voice customer service, call center | `voice-customer-support` | llm-integration-expert | +35% |
| voice rag, speech rag, talk to documents | `voice-rag` | llm-integration-expert | +35% |

### Chat with X

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| chat github, talk to repo, github qa | `chat-github` | llm-integration-expert | +30% |
| chat gmail, email assistant, gmail qa | `chat-gmail` | llm-integration-expert | +30% |
| chat pdf, talk to pdf, pdf qa | `chat-pdf` | llm-integration-expert | +30% |
| chat arxiv, research papers, scientific qa | `chat-arxiv` | llm-integration-expert | +30% |
| chat substack, newsletter qa | `chat-substack` | llm-integration-expert | +30% |
| chat youtube, video qa, youtube summary | `chat-youtube` | llm-integration-expert | +30% |
| streaming chat, real-time chat, live chat | `streaming-chatbot` | llm-integration-expert | +25% |

### Memory-Based Apps

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| arxiv memory, research memory, paper memory | `memory-arxiv` | llm-integration-expert | +30% |
| travel memory, trip memory, vacation memory | `memory-travel` | llm-integration-expert | +30% |
| stateful chat, persistent chat, llama memory | `memory-stateful-chat` | llm-integration-expert | +30% |
| personalized memory, user memory, preferences | `memory-personalized` | llm-integration-expert | +30% |
| local chatgpt, offline chatgpt, private chatgpt | `memory-local-chatgpt` | llm-integration-expert | +30% |
| multi llm memory, shared memory, cross-model | `memory-multi-llm` | llm-integration-expert | +35% |

### Fine-tuning & Optimization

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| gemma finetuning, train gemma, gemma lora | `finetune-gemma` | pytorch-expert | +35% |
| llama finetuning, train llama, llama lora | `finetune-llama` | pytorch-expert | +35% |
| token optimization, reduce tokens, toonify | `token-optimization` | llm-integration-expert | +30% |

### Odoo ERP (v24.1)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| module odoo, odoo app, erp odoo, crm odoo | - | odoo-expert | +25% |
| controller odoo, @http.route, portal odoo, api odoo | - | odoo-expert | +20% |
| wizard odoo, transient model, assistant odoo | - | odoo-expert | +20% |
| report qweb, rapport odoo, pdf odoo, impression | - | odoo-expert | +20% |
| mail.thread, message_post, notifications odoo, activites | - | odoo-expert | +20% |
| useservice, owl composant, frontend odoo, widget odoo | - | odoo-expert | +20% |
| check_access_rights, ir.rule, securite odoo, acl odoo | - | odoo-expert | +20% |
| gestion parc, it asset, licence logiciel, equipements it | - | odoo-field-service-expert | +25% |
| pos odoo, caisse, point de vente, retail | - | odoo-retail-pos-expert | +20% |
| comptabilite odoo, facture, devis, invoice | - | odoo-accounting-expert | +20% |
| manufacturing odoo, production, mrp, qualite | - | odoo-manufacturing-expert | +20% |
| healthcare odoo, patients, clinique, rendez-vous | - | odoo-healthcare-expert | +20% |
| hospitality odoo, hotel, reservations, housekeeping | - | odoo-hospitality-expert | +20% |

### SaaS Odoo (v24.1)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| saas odoo, multi-tenant, plateforme saas, vendre base odoo | - | odoo-integration-expert | +30% |
| oauth odoo, sso odoo, authentification externe, oauth provider | - | odoo-integration-expert | +25% |
| subscription billing, abonnement odoo, facturation recurrente, saas plan | - | odoo-integration-expert | +25% |
| backup s3 odoo, backup ftp, sauvegarde cloud odoo, backup rotation | - | odoo-integration-expert | +25% |
| route53 odoo, dns automatique, sous-domaine odoo, wildcard ssl | - | odoo-integration-expert | +25% |
| tenant provisioning, portail client saas, saas client, saas server | - | odoo-integration-expert | +25% |
| mailgun odoo, email transactionnel, sendgrid odoo | - | odoo-integration-expert | +20% |

### Deployment Odoo (v24.1)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| deployer odoo, installation odoo, installer odoo | - | odoo-expert | +25% |
| multi-arch odoo, ARM odoo, raspberry pi odoo | - | odoo-expert | +30% |
| pgvector odoo, embeddings odoo, vector database odoo | - | odoo-expert | +30% |
| ubuntu 24.04 odoo, debian odoo, pep 668 | - | odoo-expert | +25% |
| wkhtmltopdf, pdf odoo, rapport pdf odoo | - | odoo-expert | +20% |
| docker odoo, nginx odoo, systemd odoo | - | odoo-expert | +25% |
| production odoo, odoo.sh, odoo cloud | - | odoo-expert | +25% |

### OCA Server-Tools (v24.1)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| audit trail, auditlog, tracabilite, change tracking | - | odoo-expert | +25% |
| exception management, base_exception, regles metier | - | odoo-expert | +20% |
| database cleanup, nettoyage base, orphan purge | - | odoo-expert | +20% |
| fuzzy search, pg_trgm, recherche floue, typo tolerant | - | odoo-expert | +25% |
| time window, plage horaire, disponibilite, time slot | - | odoo-expert | +20% |
| session database, dbfilter, multi-tenancy header | - | odoo-expert | +20% |
| sentry odoo, error tracking, scheduler error, cron error | - | odoo-expert | +20% |
| module analysis, analyse module, introspection odoo | - | odoo-expert | +20% |

### ITPP-Labs Patterns (v24.1)

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| large object, lobject, gros fichiers odoo, postgresql storage | - | odoo-orm-expert | +30% |
| debranding, white label, supprimer branding, remove odoo logo | - | odoo-integration-expert | +30% |
| url attachment, lazy loading attachment, cdn attachment | - | odoo-orm-expert | +25% |
| website dependent, multi-site odoo, champs par website | - | odoo-integration-expert | +25% |
| external id sync, ir.model.data sync, search_or_create | - | odoo-integration-expert | +25% |
| itpp-labs, misc-addons, it-projects | - | odoo-expert | +20% |
| pre-commit odoo, pylint-odoo, graduated linting | - | odoo-expert | +20% |
| s3 odoo, minio odoo, object storage | - | odoo-integration-expert | +25% |
| theme kit odoo, custom branding odoo | - | odoo-integration-expert | +20% |
| context caching, ormcache_context, website context | - | odoo-orm-expert | +25% |

### Extras

| Mots-clés | Template | Agent | Confidence Boost |
|-----------|----------|-------|------------------|
| tarot, fortune telling, card reading | `chat-tarots` | llm-integration-expert | +25% |
| cursor experiments, cursor ai, cursor agent | `cursor-experiments` | llm-integration-expert | +25% |
| oss critique, code review, improvement loop | `oss-critique` | llm-integration-expert | +25% |
| resume matcher, job matching, cv matcher | `resume-job-matcher` | llm-integration-expert | +30% |
| thinkpath, thinking chatbot, reasoning bot | `thinkpath-chatbot` | llm-integration-expert | +25% |
| google adk, agent development kit, google agents | `google-adk-course` | llm-integration-expert | +30% |
| openai sdk, openai agents, swarm | `openai-sdk-course` | llm-integration-expert | +30% |

---

## Flow de Décision Complet

```
USER INPUT
    │
    ▼
┌─────────────────────────────────────────┐
│ 1. EXTRACTION KEYWORDS                   │
│    • Verbs: [créer, faire...]           │
│    • Nouns: [site, jeu...]              │
│    • Tech: [react, supabase...]         │
│    • Sentiment: positive/negative        │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ 2. SCORING PAR INTENT                    │
│    CREATE: 85%                           │
│    MODIFY: 10%                           │
│    DEBUG: 5%                             │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ 3. TEMPLATE MATCHING                     │
│    Keywords: [restaurant, menu]          │
│    → Template: restaurant                │
│    → Confidence boost: +20%              │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ 4. DÉCISION                              │
│    Intent: CREATE (85%)                  │
│    Template: restaurant                  │
│    Confidence: 85% + 20% = 100% (cap)    │
│    Threshold: 70%                        │
│    → needsWizard: false                  │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ 5. OUTPUT                                │
│    A) Si confidence >= threshold:        │
│       → Exécution directe avec confirm   │
│    B) Si confidence < threshold:         │
│       → Route vers Wizard Agent          │
└─────────────────────────────────────────┘
```

---

## Exemples de Parsing

### Haute Confiance (Exécution Directe)

```javascript
// Input: "Crée-moi un Tetris"
parse("Crée-moi un Tetris")
// Output:
{
  intent: "CREATE",
  confidence: 0.95,
  template: "game-puzzle",
  agent: "phaser-expert",
  needsWizard: false,
  action: "CONFIRM_AND_EXECUTE",
  message: "Je crée un jeu Tetris avec Phaser 3. OK?"
}
```

### Moyenne Confiance (Wizard Minimal)

```javascript
// Input: "Je veux un site pour mon business"
parse("Je veux un site pour mon business")
// Output:
{
  intent: "CREATE",
  confidence: 0.72,
  template: null,  // Pas assez précis
  needsWizard: true,
  wizardFlow: "creation_web",
  questions: ["type"]  // Une seule question
}
```

### Basse Confiance (Wizard Complet)

```javascript
// Input: "Je veux créer quelque chose de cool"
parse("Je veux créer quelque chose de cool")
// Output:
{
  intent: "CREATE",
  confidence: 0.35,
  template: null,
  needsWizard: true,
  wizardFlow: "generic_creation",
  questions: ["category", "type", "features", "name"]
}
```

### Intent DEBUG

```javascript
// Input: "J'ai une erreur dans mon code"
parse("J'ai une erreur dans mon code")
// Output:
{
  intent: "DEBUG",
  confidence: 0.75,
  needsWizard: true,  // Besoin plus d'infos
  wizardFlow: "debug",
  questions: ["error_type", "error_message"]
}
```

---

## Gestion Ambiguïté

### Multi-Intent Détecté

Si plusieurs intents ont des scores proches (< 15% différence):

```javascript
// Input: "Ajoute un bouton de paiement au site"
{
  primaryIntent: "MODIFY",    // 55%
  secondaryIntent: "CREATE",  // 45%
  ambiguous: true,
  resolution: "ASK",
  question: "Tu veux modifier un site existant ou en créer un nouveau?"
}
```

### Mots Contradictoires

```javascript
// Input: "Crée un fix pour le bug"
// "Crée" → CREATE, "fix" + "bug" → DEBUG
{
  intent: "DEBUG",  // DEBUG gagne car fix+bug plus spécifique
  confidence: 0.65,
  note: "Création liée à la résolution d'un bug"
}
```

---

## Intégration Système

### Appel depuis le Système Principal

```javascript
// Dans le flow principal ULTRA-CREATE
async function processUserMessage(message) {
  // 1. Parse l'intent
  const parsed = intentParser.parse(message);

  // 2. Log pour debug
  console.log(`Intent: ${parsed.intent} (${parsed.confidence * 100}%)`);

  // 3. Route appropriée
  if (parsed.needsWizard) {
    return wizardAgent.start(parsed.wizardFlow, parsed.questions);
  } else {
    return executeAction(parsed);
  }
}
```

### Feedback Loop

```javascript
// Après exécution, améliorer le parser
function learnFromInteraction(originalMessage, finalAction, userSatisfied) {
  if (userSatisfied) {
    // Renforcer le mapping
    hindsight_retain({
      bank: 'patterns',
      content: `Message: "${originalMessage}" → Action: ${finalAction}`,
      context: 'intent-parser-learning'
    });
  }
}
```

---

## Configuration

### Thresholds Personnalisables

```yaml
# config/intent-parser.yaml
thresholds:
  CREATE: 0.70
  MODIFY: 0.70
  DEBUG: 0.60
  DEPLOY: 0.80
  EXPLAIN: 0.50
  EXPLORE: 0.50
  RESEARCH: 0.60

# Ajuster si trop/pas assez de questions wizard
adjustment:
  more_questions: -0.10  # Baisser les seuils
  less_questions: +0.10  # Augmenter les seuils
```

---

*Intent Parser v2.0 - ULTRA-CREATE v24.0 Natural Language Mode*
