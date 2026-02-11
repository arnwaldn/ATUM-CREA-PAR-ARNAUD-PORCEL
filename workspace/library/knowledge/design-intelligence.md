# Design Intelligence - Base de Donnees Design

> **Usage** : Consulter AVANT toute creation de projet avec interface utilisateur.
> **Quand** : Phase RECHERCHER, apres detection du type de produit.
> **Source** : Synthetise depuis ui-ux-pro-max-skill (96 palettes, 57 fonts, 100 regles UI, 99 guidelines UX).

---

## 1. Palettes Couleurs par Type de Produit

Chaque palette est optimisee pour son contexte. Utiliser les couleurs hex directement dans le code.

| Type de Produit | Primary | Secondary | CTA | Background | Text | Border | Notes |
|-----------------|---------|-----------|-----|------------|------|--------|-------|
| SaaS (General) | #2563EB | #3B82F6 | #F97316 | #F8FAFC | #1E293B | #E2E8F0 | Trust blue + orange CTA |
| Micro SaaS | #6366F1 | #818CF8 | #10B981 | #F5F3FF | #1E1B4B | #E0E7FF | Indigo + emerald CTA |
| E-commerce | #059669 | #10B981 | #F97316 | #ECFDF5 | #064E3B | #A7F3D0 | Success green + urgency orange |
| E-commerce Luxury | #1C1917 | #44403C | #CA8A04 | #FAFAF9 | #0C0A09 | #D6D3D1 | Premium dark + gold |
| Service Landing | #0EA5E9 | #38BDF8 | #F97316 | #F0F9FF | #0C4A6E | #BAE6FD | Sky blue + warm CTA |
| B2B Service | #0F172A | #334155 | #0369A1 | #F8FAFC | #020617 | #E2E8F0 | Navy + blue CTA |
| Financial Dashboard | #0F172A | #1E293B | #22C55E | #020617 | #F8FAFC | #334155 | Dark bg + green indicators |
| Analytics Dashboard | #1E40AF | #3B82F6 | #F59E0B | #F8FAFC | #1E3A8A | #DBEAFE | Blue data + amber highlights |
| Healthcare App | #0891B2 | #22D3EE | #059669 | #ECFEFF | #164E63 | #A5F3FC | Calm cyan + health green |
| Educational App | #4F46E5 | #818CF8 | #F97316 | #EEF2FF | #1E1B4B | #C7D2FE | Playful indigo + orange |
| Creative Agency | #EC4899 | #F472B6 | #06B6D4 | #FDF2F8 | #831843 | #FBCFE8 | Bold pink + cyan |
| Portfolio/Personal | #18181B | #3F3F46 | #2563EB | #FAFAFA | #09090B | #E4E4E7 | Monochrome + blue accent |
| Gaming | #7C3AED | #A78BFA | #F43F5E | #0F0F23 | #E2E8F0 | #4C1D95 | Neon purple + rose action |
| Fintech/Crypto | #F59E0B | #FBBF24 | #8B5CF6 | #0F172A | #F8FAFC | #334155 | Gold + purple tech |
| Social Media | #E11D48 | #FB7185 | #2563EB | #FFF1F2 | #881337 | #FECDD3 | Vibrant rose + blue |
| Productivity Tool | #0D9488 | #14B8A6 | #F97316 | #F0FDFA | #134E4A | #99F6E4 | Teal focus + orange action |
| AI/Chatbot Platform | #7C3AED | #A78BFA | #06B6D4 | #FAF5FF | #1E1B4B | #DDD6FE | AI purple + cyan |
| NFT/Web3 | #8B5CF6 | #A78BFA | #FBBF24 | #0F0F23 | #F8FAFC | #4C1D95 | Purple + gold value |
| Restaurant/Food | #DC2626 | #F87171 | #CA8A04 | #FEF2F2 | #450A0A | #FECACA | Appetizing red + gold |
| Coffee Shop | #78350F | #92400E | #FBBF24 | #FEF3C7 | #451A03 | #FDE68A | Coffee brown + warm gold |
| Fitness/Gym | #F97316 | #FB923C | #22C55E | #1F2937 | #F8FAFC | #374151 | Energy orange + success green |
| Real Estate | #0F766E | #14B8A6 | #0369A1 | #F0FDFA | #134E4A | #99F6E4 | Trust teal + blue |
| Travel/Tourism | #0EA5E9 | #38BDF8 | #F97316 | #F0F9FF | #0C4A6E | #BAE6FD | Sky blue + adventure orange |
| Hotel/Hospitality | #1E3A8A | #3B82F6 | #CA8A04 | #F8FAFC | #1E40AF | #BFDBFE | Luxury navy + gold |
| Wedding/Event | #DB2777 | #F472B6 | #CA8A04 | #FDF2F8 | #831843 | #FBCFE8 | Romantic pink + gold |
| Legal Services | #1E3A8A | #1E40AF | #B45309 | #F8FAFC | #0F172A | #CBD5E1 | Authority navy + trust gold |
| Beauty/Spa | #EC4899 | #F9A8D4 | #8B5CF6 | #FDF2F8 | #831843 | #FBCFE8 | Soft pink + lavender |
| News/Media | #DC2626 | #EF4444 | #1E40AF | #FEF2F2 | #450A0A | #FECACA | Breaking red + link blue |
| Developer Tool | #1E293B | #334155 | #22C55E | #0F172A | #F8FAFC | #475569 | Code dark + run green |
| Cybersecurity | #00FF41 | #0D0D0D | #FF3333 | #000000 | #E0E0E0 | #1F1F1F | Matrix green + alert red |
| Non-profit | #0891B2 | #22D3EE | #F97316 | #ECFEFF | #164E63 | #A5F3FC | Compassion blue + orange |
| Music Streaming | #1E1B4B | #4338CA | #22C55E | #0F0F23 | #F8FAFC | #312E81 | Dark audio + play green |
| Sustainability | #059669 | #10B981 | #FBBF24 | #ECFDF5 | #064E3B | #A7F3D0 | Nature green + solar gold |
| Banking | #0F172A | #1E3A8A | #CA8A04 | #F8FAFC | #020617 | #E2E8F0 | Trust navy + premium gold |
| Luxury/Premium | #1C1917 | #44403C | #CA8A04 | #FAFAF9 | #0C0A09 | #D6D3D1 | Premium black + gold |

---

## 2. Pairings Typographiques

Chaque pairing inclut les imports CSS prets a copier et la config Tailwind.

### Pairings Principaux

| Nom | Heading | Body | Mood | Best For |
|-----|---------|------|------|----------|
| Classic Elegant | Playfair Display | Inter | elegant, luxury, premium | Luxury, fashion, spa, beauty |
| Modern Professional | Poppins | Open Sans | modern, professional, clean | SaaS, corporate, business |
| Tech Startup | Space Grotesk | DM Sans | tech, innovative, bold | Tech, startups, SaaS, AI |
| Minimal Swiss | Inter | Inter | minimal, functional, neutral | Dashboards, admin, design systems |
| Playful Creative | Fredoka | Nunito | playful, fun, warm | Children, education, gaming |
| Bold Statement | Bebas Neue | Source Sans 3 | bold, impactful, dramatic | Marketing, portfolios, agencies |
| Wellness Calm | Lora | Raleway | calm, health, natural | Wellness, spa, meditation |
| Developer Mono | JetBrains Mono | IBM Plex Sans | code, technical, precise | Dev tools, docs, tech blogs |
| Geometric Modern | Outfit | Work Sans | geometric, contemporary | General purpose, landing pages |
| Luxury Serif | Cormorant | Montserrat | luxury, elegant, refined | Fashion, jewelry, high-end |
| Friendly SaaS | Plus Jakarta Sans | Plus Jakarta Sans | friendly, modern, saas | SaaS, web apps, dashboards |
| Corporate Trust | Lexend | Source Sans 3 | corporate, accessible | Enterprise, government, healthcare |
| Fashion Forward | Syne | Manrope | fashion, avant-garde, edgy | Fashion, creative agencies |
| Financial Trust | IBM Plex Sans | IBM Plex Sans | financial, professional | Banks, finance, insurance |
| Restaurant Menu | Playfair Display SC | Karla | culinary, elegant | Restaurants, cafes, hospitality |
| Crypto/Web3 | Orbitron | Exo 2 | crypto, futuristic, digital | Crypto, NFT, blockchain |
| Gaming Bold | Russo One | Chakra Petch | gaming, action, energetic | Gaming, esports, entertainment |
| E-commerce Clean | Rubik | Nunito Sans | ecommerce, clean, retail | Online stores, product pages |
| Accessibility First | Atkinson Hyperlegible | Atkinson Hyperlegible | accessible, inclusive, WCAG | Gov, healthcare, inclusive design |
| Dashboard Data | Fira Code | Fira Sans | dashboard, analytics, data | Dashboards, analytics, admin |

### CSS Imports (copier-coller)

```css
/* SaaS / Tech */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* Modern Professional */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');

/* Luxury / Elegant */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

/* Minimal / Dashboard */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Friendly SaaS */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

/* Developer */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

/* Gaming */
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Russo+One&display=swap');

/* Accessibility */
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap');
```

### Tailwind Config (fontFamily)

```javascript
// Tech Startup
fontFamily: { heading: ['Space Grotesk', 'sans-serif'], body: ['DM Sans', 'sans-serif'] }

// Modern Professional
fontFamily: { heading: ['Poppins', 'sans-serif'], body: ['Open Sans', 'sans-serif'] }

// Luxury
fontFamily: { serif: ['Playfair Display', 'serif'], sans: ['Inter', 'sans-serif'] }

// Minimal Swiss
fontFamily: { sans: ['Inter', 'sans-serif'] }

// Friendly SaaS
fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] }

// Developer
fontFamily: { mono: ['JetBrains Mono', 'monospace'], sans: ['IBM Plex Sans', 'sans-serif'] }
```

---

## 3. Regles UI Reasoning (Produit -> Design)

Mapping automatique : type de produit -> patterns recommandes, styles, effets, et anti-patterns a eviter.

| Type Produit | Pattern Recommande | Style | Effets Cles | Anti-Patterns |
|-------------|-------------------|-------|-------------|---------------|
| SaaS (General) | Hero + Features + CTA | Glassmorphism + Flat | Subtle hover 200-250ms | Excessive animation, dark mode default |
| E-commerce | Feature-Rich Showcase | Vibrant & Block-based | Card hover lift 200ms, scale | Flat sans profondeur, pages text-heavy |
| E-commerce Luxury | Feature-Rich Showcase | Liquid Glass + Glassmorphism | Chromatic aberration, fluid 400-600ms | Block-based vibrant, couleurs playful |
| Healthcare | Social Proof-Focused | Neumorphism + Accessible | Soft box-shadow, smooth press 150ms | Neon colors, motion-heavy, AI gradients |
| Fintech/Crypto | Conversion-Optimized | Glassmorphism + Dark Mode | Real-time charts, alert pulse/glow | Light backgrounds, no security indicators |
| Education | Feature-Rich Showcase | Claymorphism + Micro-interactions | Soft press 200ms, fluffy elements | Dark modes, complex jargon |
| Portfolio | Storytelling-Driven | Motion-Driven + Minimalism | Parallax 3-5 layers, scroll-triggered | Corporate templates, generic layouts |
| Government | Minimal & Direct | Accessible & Ethical | Focus rings 3-4px, skip links | Ornate design, low contrast, AI gradients |
| Gaming | Feature-Rich Showcase | 3D & Hyperrealism + Retro-Futurism | WebGL 3D, glitch effects | Minimalist design, static assets |
| Creative Agency | Storytelling-Driven | Brutalism + Motion-Driven | CRT scanlines, neon glow, glitch | Corporate minimalism, hidden portfolio |
| Restaurant/Food | Hero-Centric + Conversion | Vibrant & Block + Motion | Food image reveal, menu hover | Low-quality imagery, outdated hours |
| Real Estate | Hero-Centric + Feature-Rich | Glassmorphism + Minimalism | 3D property tour, map hover | Poor photos, no virtual tours |
| SaaS Dashboard | Data-Dense Dashboard | Data-Dense + Heat Map | Hover tooltips, chart zoom, real-time | Ornate design, slow rendering |
| B2B Enterprise | Feature-Rich + Trust | Trust & Authority + Minimal | Section transitions, feature reveals | Playful design, AI gradients |
| Beauty/Spa | Hero-Centric + Social Proof | Soft UI + Neumorphism | Soft shadows, smooth 200-300ms, gentle | Bright neon, harsh animations, dark mode |
| Music/Entertainment | Feature-Rich Showcase | Dark Mode OLED + Vibrant | Waveform visualization, playlist anim | Cluttered layout, poor audio player |
| Legal Services | Trust & Authority + Minimal | Trust & Authority + Minimalism | Practice area reveal, attorney profiles | Outdated design, AI gradients |
| Fitness/Gym | Feature-Rich + Data | Vibrant & Block + Dark Mode | Progress ring, achievement unlocks | Static design, no gamification |
| AI/Chatbot | Interactive Demo + Minimal | AI-Native UI + Minimalism | Streaming text, typing indicators | Heavy chrome, slow response feedback |
| Developer Tool | Minimal + Documentation | Dark Mode OLED + Minimalism | Syntax highlighting, command palette | Light mode default, slow performance |
| News/Media | Hero-Centric + Feature-Rich | Minimalism + Flat | Breaking news badge, article reveals | Cluttered layout, slow loading |
| Wedding/Event | Storytelling + Social Proof | Soft UI + Aurora UI | Gallery reveals, timeline animations | Generic templates, no portfolio |
| Cybersecurity | Trust & Authority + Real-Time | Cyberpunk UI + Dark Mode | Threat visualization, alert animations | Light mode, poor data viz |
| Non-profit | Storytelling + Trust | Accessible & Ethical + Organic | Impact counter, story reveals | No impact data, hidden financials |
| Sustainability | Trust & Authority + Data | Organic Biophilic + Minimalism | Progress indicators, impact animations | Greenwashing visuals, no data |

---

## 4. Checklist Pre-Livraison UI

Verifier AVANT chaque livraison de code UI. Integre a la Gate B du cycle VERIFIER.

### Qualite Visuelle
- [ ] Pas d'emojis utilises comme icones (utiliser SVG : Heroicons, Lucide)
- [ ] Icones d'un seul set coherent
- [ ] Logos de marque corrects (Simple Icons)
- [ ] Hover states ne causent pas de layout shift
- [ ] Couleurs du theme utilisees directement (bg-primary, pas var())

### Interaction
- [ ] Tous les elements cliquables ont `cursor-pointer`
- [ ] Hover states fournissent un feedback visuel clair
- [ ] Transitions fluides (150-300ms)
- [ ] Focus states visibles pour navigation clavier (`focus:ring-2`)

### Contraste Light/Dark
- [ ] Texte light mode : contraste minimum 4.5:1
- [ ] Elements glass/transparents visibles en light mode (`bg-white/80` min)
- [ ] Bordures visibles dans les deux modes
- [ ] Tester les deux modes avant livraison

### Layout
- [ ] Elements flottants ont un espacement correct des bords
- [ ] Pas de contenu cache derriere les navbars fixes
- [ ] Responsive teste : 375px, 768px, 1024px, 1440px
- [ ] Pas de scroll horizontal sur mobile

### Accessibilite
- [ ] Toutes les images ont un alt text
- [ ] Inputs de formulaire ont des labels
- [ ] Couleur n'est pas le seul indicateur
- [ ] `prefers-reduced-motion` respecte
- [ ] Touch targets minimum 44x44px

---

## 5. Regles UX Critiques (HIGH Severity)

### Accessibilite (CRITICAL)
| Regle | Do | Don't |
|-------|-----|-------|
| Contraste couleur | Min 4.5:1 pour texte normal | Texte #999 sur fond blanc (2.8:1) |
| Focus states | `focus:ring-2 focus:ring-blue-500` visible | `outline-none` sans remplacement |
| Alt text | Alt descriptif pour images significatives | Alt vide pour images de contenu |
| ARIA labels | `aria-label` pour boutons icon-only | `<button><Icon/></button>` sans label |
| Navigation clavier | Tab order = ordre visuel | Elements inaccessibles au clavier |
| Labels formulaires | `<label for="email">` | Placeholder comme seul label |

### Touch & Interaction (CRITICAL)
| Regle | Do | Don't |
|-------|-----|-------|
| Touch target | Min 44x44px sur mobile | Boutons 24x24px |
| Hover vs Tap | Click/tap pour actions principales | Hover-only pour actions critiques |
| Boutons loading | Desactiver + spinner pendant async | Permettre multi-click |
| Feedback erreur | Message clair pres du probleme | Echec silencieux |

### Performance (HIGH)
| Regle | Do | Don't |
|-------|-----|-------|
| Images | WebP, srcset, lazy loading | Images 4000px pour affichage 400px |
| Reduced motion | Verifier `prefers-reduced-motion` | Ignorer les preferences utilisateur |
| Content jumping | Reserver l'espace pour contenu async | Layout shift a chaque chargement |
| Font loading | `font-display: swap` | FOIT (Flash of Invisible Text) |

### Layout & Responsive (HIGH)
| Regle | Do | Don't |
|-------|-----|-------|
| Viewport | `width=device-width, initial-scale=1` | Pas de meta viewport |
| Font size mobile | Min 16px body text | text-xs pour body |
| Scroll horizontal | Contenu dans viewport width | Contenu qui deborde |
| Z-index | Echelle definie (10, 20, 30, 50) | z-[9999] arbitraire |
| Line length | Max 65-75 caracteres | Texte pleine largeur |
| Viewport height | `min-h-dvh` ou dvh | `100vh` sur mobile (barre navigateur) |

### Animation (MEDIUM)
| Regle | Do | Don't |
|-------|-----|-------|
| Duration | 150-300ms pour micro-interactions | > 500ms pour feedback UI |
| Performance | `transform` et `opacity` | Animer width/height/top/left |
| Usage | 1-2 elements animes par vue max | Tout animer |
| Easing | `ease-out` entree, `ease-in` sortie | `linear` pour UI |

---

## 6. Mapping Rapide : Type Projet ATUM CREA -> Design

Reference croisee avec le tableau PROJETS -> STACKS de CLAUDE.md.

| Type ATUM CREA | Palette | Font Pairing | Pattern UI | Animations (voir `creative-web-animations.md`) |
|----------------|---------|-------------|------------|-----------------------------------------------|
| Web SaaS | SaaS (General) | Tech Startup ou Friendly SaaS | Hero + Features + CTA | Reveals scroll, micro-interactions, counters |
| Web Landing | Service Landing | Modern Professional | Hero-Centric + Trust | Parallax hero, scroll storytelling, CTA magnetique |
| Web E-commerce | E-commerce ou Luxury | E-commerce Clean | Feature-Rich Showcase | Grid transitions, image hovers, smooth scroll |
| Web Dashboard | Analytics Dashboard | Minimal Swiss ou Dashboard Data | Data-Dense Dashboard | Legere : counters, subtle reveals |
| Mobile | Selon secteur | Modern Professional | Feature-Rich + Touch | Framer Motion, gesture-driven, springs |
| Desktop | Selon secteur | Minimal Swiss | Minimal + Functional | Framer Motion, transitions fluides |
| Game 2D/3D | Gaming | Gaming Bold | 3D & Hyperrealism | Three.js full scene, WebGPU, particles |
| AI Agent | AI/Chatbot Platform | Tech Startup | AI-Native + Minimal | Typewriter, text scramble, particle fields |
| Portfolio/Agence | Creative Agency | Editorial Craft | WebGL + Custom Cursor | Hero WebGL, page transitions, hover distortion |
| Startup/Tech | Fintech/Crypto | Tech Startup | Hero 3D + Grid Stagger | Hero 3D R3F, magnetic buttons, gradient anim |

---

*Design Intelligence - ATUM CREA Knowledge Library v24.2*
*Source: ui-ux-pro-max-skill (nextlevelbuilder)*
