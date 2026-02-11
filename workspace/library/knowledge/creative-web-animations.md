# Creative Web Animations - Pattern Reference

> **Source** : Patterns distilles de Codrops (tympanus.net/codrops) — 1500+ demos
> **Usage** : Ajouter des animations et effets visuels modernes aux sites web et applications
> **Quand** : Tout projet avec UI qui necessite un rendu premium (landing pages, portfolios, SaaS, e-commerce)

---

## 1. Stack d'Animation Web

| Technologie | Usage Principal | Quand Utiliser |
|-------------|-----------------|----------------|
| **GSAP + ScrollTrigger** | Scroll-driven, timelines, morphing | Tout projet web avec animations |
| **React Three Fiber** | Effets WebGL dans React | Hero 3D, galeries immersives, backgrounds |
| **Three.js + TSL** | WebGPU, shaders avances | Effets experimentaux, particules |
| **Framer Motion** | Animations de composants React | Transitions UI, micro-interactions |
| **CSS View Transitions API** | Transitions de page natives | Navigation multi-page fluide |
| **Lenis** | Smooth scrolling | Base pour tout scroll-driven |

### Installation type (Next.js)
```bash
npm install gsap @gsap/react lenis
npm install @react-three/fiber @react-three/drei three
```

### Setup GSAP dans Next.js
```tsx
"use client"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function AnimatedSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(".reveal", {
      y: 100,
      opacity: 0,
      stagger: 0.2,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
  }, { scope: containerRef })

  return <div ref={containerRef}>...</div>
}
```

---

## 2. Scroll-Driven Animation Patterns

### 2.1 Parallax multicouche
```tsx
useGSAP(() => {
  gsap.to(".bg-layer", { y: "-30%", ease: "none",
    scrollTrigger: { trigger: ".hero", scrub: true }
  })
  gsap.to(".mid-layer", { y: "-15%", ease: "none",
    scrollTrigger: { trigger: ".hero", scrub: true }
  })
  gsap.to(".fg-layer", { y: "10%", ease: "none",
    scrollTrigger: { trigger: ".hero", scrub: true }
  })
})
```

### 2.2 Reveal au scroll (stagger)
```tsx
useGSAP(() => {
  gsap.utils.toArray<HTMLElement>(".card").forEach((card, i) => {
    gsap.from(card, {
      y: 80, opacity: 0, duration: 0.8,
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    })
  })
})
```

### 2.3 Pin + scrub (storytelling scroll)
```tsx
useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".story-section",
      pin: true,
      start: "top top",
      end: "+=2000",
      scrub: 1,
      snap: { snapTo: "labels", duration: 0.3 }
    }
  })
  tl.addLabel("intro")
    .from(".headline", { scale: 0.5, opacity: 0 })
    .addLabel("details")
    .from(".details", { x: -100, opacity: 0 })
    .addLabel("cta")
    .from(".cta-button", { y: 50, opacity: 0 })
})
```

### 2.4 Progress bar liee au scroll
```tsx
useGSAP(() => {
  gsap.to(".progress-bar", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3
    }
  })
})
```

### 2.5 Texte dual-wave (sinusoidal)
```tsx
useGSAP(() => {
  const chars = gsap.utils.toArray<HTMLElement>(".split-char")
  chars.forEach((char, i) => {
    gsap.to(char, {
      y: () => Math.sin(i * 0.3) * 40,
      ease: "none",
      scrollTrigger: {
        trigger: ".text-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    })
  })
})
```

---

## 3. Page Transition Patterns

### 3.1 CSS View Transitions API (natif)
```tsx
// Next.js App Router — layout.tsx
"use client"
import { useRouter } from "next/navigation"

function navigateWithTransition(href: string) {
  if (!document.startViewTransition) {
    router.push(href)
    return
  }
  document.startViewTransition(() => {
    router.push(href)
  })
}
```

```css
/* Transition CSS */
::view-transition-old(root) {
  animation: slide-out 0.3s ease-in;
}
::view-transition-new(root) {
  animation: slide-in 0.3s ease-out;
}
@keyframes slide-out {
  to { transform: translateX(-100%); opacity: 0; }
}
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
}
```

### 3.2 Shared element transition
```css
/* Element source */
.card-image {
  view-transition-name: hero-image;
}
/* Element destination */
.detail-hero {
  view-transition-name: hero-image;
}
/* Le navigateur anime automatiquement entre les deux */
```

### 3.3 Cover transition (GSAP)
```tsx
function coverTransition(href: string) {
  const cover = document.querySelector(".page-cover")
  gsap.timeline()
    .to(cover, { scaleY: 1, transformOrigin: "bottom", duration: 0.4, ease: "power3.inOut" })
    .call(() => router.push(href))
    .to(cover, { scaleY: 0, transformOrigin: "top", duration: 0.4, ease: "power3.inOut", delay: 0.1 })
}
```

---

## 4. Hover Effect Patterns

### 4.1 Magnetic button
```tsx
function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = ref.current!
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" })
  }

  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" })
  }

  return (
    <button ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </button>
  )
}
```

### 4.2 Text scramble on hover
```tsx
function useTextScramble(text: string) {
  const [display, setDisplay] = useState(text)
  const chars = "!<>-_\\/[]{}—=+*^?#_"

  const scramble = () => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplay(text.split("").map((char, i) => {
        if (i < iteration) return text[i]
        return chars[Math.floor(Math.random() * chars.length)]
      }).join(""))
      iteration += 1 / 3
      if (iteration >= text.length) clearInterval(interval)
    }, 30)
  }

  return { display, scramble }
}
```

### 4.3 Image reveal clip-path
```css
.image-container {
  clip-path: inset(100% 0 0 0);
  transition: clip-path 0.6s cubic-bezier(0.77, 0, 0.175, 1);
}
.card:hover .image-container {
  clip-path: inset(0% 0 0 0);
}
```

### 4.4 RGB shift on hover (CSS)
```css
.glitch-text:hover {
  animation: rgb-shift 0.3s ease;
}
@keyframes rgb-shift {
  0% { text-shadow: 2px 0 red, -2px 0 cyan; }
  50% { text-shadow: -2px 2px red, 2px -2px cyan; }
  100% { text-shadow: 0 0 transparent; }
}
```

### 4.5 Cursor custom avec trailing
```tsx
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.1 })
      gsap.to(followerRef.current, { x: e.clientX, y: e.clientY, duration: 0.4 })
    }
    window.addEventListener("mousemove", moveCursor)
    return () => window.removeEventListener("mousemove", moveCursor)
  }, [])

  return (
    <>
      <div ref={cursorRef} className="fixed w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" />
      <div ref={followerRef} className="fixed w-8 h-8 border border-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 opacity-50" />
    </>
  )
}
```

---

## 5. WebGL / React Three Fiber pour Web Design

### 5.1 Hero 3D avec geometrie animee
```tsx
import { Canvas, useFrame } from "@react-three/fiber"
import { MeshDistortMaterial, Sphere } from "@react-three/drei"

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.2
    }
  })
  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.5}>
      <MeshDistortMaterial color="#8b5cf6" distort={0.4} speed={2} roughness={0} />
    </Sphere>
  )
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <AnimatedSphere />
      </Canvas>
    </div>
  )
}
```

### 5.2 Image gallery avec shader distortion
```tsx
import { useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"

function DistortedImage({ url }: { url: string }) {
  const texture = useTexture(url)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh>
      <planeGeometry args={[3, 2, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTexture: { value: texture },
          uTime: { value: 0 },
          uHover: { value: 0 }
        }}
        vertexShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform float uHover;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.z += sin(pos.x * 4.0 + uTime) * 0.05 * uHover;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform sampler2D uTexture;
          void main() {
            gl_FragColor = texture2D(uTexture, vUv);
          }
        `}
      />
    </mesh>
  )
}
```

### 5.3 Particle text dissolution (WebGPU-ready)
```tsx
import { Points, PointMaterial } from "@react-three/drei"
import { useMemo, useRef } from "react"

function ParticleField({ count = 5000 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [count])

  const ref = useRef<THREE.Points>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.05
  })

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color="#8b5cf6" size={0.02} sizeAttenuation depthWrite={false} />
    </Points>
  )
}
```

---

## 6. Typography Animation Patterns

### 6.1 Split text reveal (GSAP)
```tsx
import SplitType from "split-type"

useGSAP(() => {
  const text = new SplitType(".headline", { types: "chars" })
  gsap.from(text.chars, {
    y: 100,
    opacity: 0,
    rotateX: -90,
    stagger: 0.02,
    duration: 0.8,
    ease: "back.out(1.7)",
    scrollTrigger: {
      trigger: ".headline",
      start: "top 80%"
    }
  })
})
```

### 6.2 Typewriter effect
```tsx
function Typewriter({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed(prev => prev + text[index])
        setIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    }
  }, [index, text, speed])

  return <span>{displayed}<span className="animate-pulse">|</span></span>
}
```

### 6.3 Counter animate (chiffres)
```tsx
useGSAP(() => {
  gsap.from(".counter", {
    textContent: 0,
    duration: 2,
    snap: { textContent: 1 },
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".counter",
      start: "top 80%"
    }
  })
})
```

---

## 7. Grid & Layout Animation Patterns

### 7.1 GSAP Flip (layout morphing)
```tsx
import { Flip } from "gsap/Flip"
gsap.registerPlugin(Flip)

function toggleLayout() {
  const state = Flip.getState(".grid-item")
  // Modifier le layout (toggle class, changer grid template, etc.)
  container.classList.toggle("list-view")
  Flip.from(state, {
    duration: 0.6,
    ease: "power2.inOut",
    stagger: 0.05,
    absolute: true
  })
}
```

### 7.2 Staggered grid reveal
```tsx
useGSAP(() => {
  gsap.from(".grid-item", {
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    stagger: {
      each: 0.1,
      grid: "auto",
      from: "center"
    },
    scrollTrigger: {
      trigger: ".grid",
      start: "top 80%"
    }
  })
})
```

### 7.3 Masonry layout transition
```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.grid-item {
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1),
              opacity 0.4s ease;
}
.grid-item.entering {
  animation: item-enter 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}
@keyframes item-enter {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
```

---

## 8. Smooth Scrolling (Lenis)

```tsx
"use client"
import Lenis from "lenis"
import { useEffect } from "react"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Sync avec GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => lenis.destroy()
  }, [])

  return <>{children}</>
}
```

---

## 9. SVG Filter Effects (zero WebGL, ultra-leger)

### 9.1 Gooey effect (SVG filter)
```html
<!-- Definir une fois dans le DOM -->
<svg class="hidden" xmlns="http://www.w3.org/2000/svg">
  <filter id="gooey">
    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
    <feColorMatrix in="blur" mode="matrix"
      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="gooey" />
    <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
  </filter>
</svg>
```
```css
/* Appliquer sur le conteneur */
.gooey-container {
  filter: url(#gooey);
}
/* Les elements enfants qui se chevauchent fusionnent visuellement */
.gooey-blob {
  background: #8b5cf6;
  border-radius: 50%;
  transition: transform 0.3s ease;
}
```

### 9.2 SVG morphing (GSAP MorphSVG)
```tsx
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
gsap.registerPlugin(MorphSVGPlugin)

useGSAP(() => {
  gsap.to("#circle", {
    morphSVG: "#star",
    duration: 1,
    ease: "power2.inOut",
    scrollTrigger: {
      trigger: ".morph-section",
      start: "top center",
      toggleActions: "play reverse play reverse"
    }
  })
})
```

### 9.3 SVG path drawing animation
```tsx
useGSAP(() => {
  const paths = gsap.utils.toArray<SVGPathElement>(".draw-path")
  paths.forEach(path => {
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 2,
      ease: "power2.inOut",
      scrollTrigger: { trigger: path, start: "top 80%" }
    })
  })
})
```

### 9.4 SVG filter distortion on hover
```css
.distort-hover {
  filter: url(#turbulence);
  transition: filter 0.3s ease;
}
.distort-hover:hover {
  filter: url(#turbulence-active);
}
```
```html
<svg class="hidden">
  <filter id="turbulence">
    <feTurbulence type="fractalNoise" baseFrequency="0" numOctaves="1" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" />
  </filter>
  <filter id="turbulence-active">
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
  </filter>
</svg>
```

---

## 10. Image Distortion Hover (WebGL displacement)

### 10.1 Hover displacement effect (le plus iconique de Codrops)
```tsx
// Shader uniforms: mouse position controle la distortion
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform sampler2D uDisplacement;
  uniform float uHover;
  void main() {
    vec4 disp = texture2D(uDisplacement, vUv);
    vec2 distortedUv = vUv + disp.rg * uHover * 0.1;
    gl_FragColor = texture2D(uImage, distortedUv);
  }
`
// uHover interpole de 0 a 1 au mouseenter, 1 a 0 au mouseleave
```

### 10.2 Progressive blur on scroll
```tsx
useGSAP(() => {
  gsap.to(".blur-reveal", {
    filter: "blur(0px)",
    ease: "none",
    scrollTrigger: {
      trigger: ".blur-reveal",
      start: "top bottom",
      end: "top center",
      scrub: true
    }
  })
})
// CSS initial: .blur-reveal { filter: blur(20px); }
```

### 10.3 RGB split / chromatic aberration
```glsl
// Fragment shader pour split RGB
uniform sampler2D uTexture;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  float r = texture2D(uTexture, vUv + vec2(uIntensity, 0.0)).r;
  float g = texture2D(uTexture, vUv).g;
  float b = texture2D(uTexture, vUv - vec2(uIntensity, 0.0)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
```

---

## 11. Loading & Preloader Animations

### 11.1 Counter preloader (0 → 100%)
```tsx
function Preloader({ onComplete }: { onComplete: () => void }) {
  const counterRef = useRef<HTMLSpanElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ onComplete })
    tl.to(counterRef.current, {
      textContent: 100,
      duration: 2.5,
      snap: { textContent: 1 },
      ease: "power2.inOut"
    })
    .to(overlayRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: "power3.inOut"
    })
  })

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <span ref={counterRef} className="text-7xl font-bold text-white">0</span>
      <span className="text-7xl font-bold text-white">%</span>
    </div>
  )
}
```

### 11.2 Grid reveal loader
```tsx
useGSAP(() => {
  gsap.from(".loader-tile", {
    scaleY: 1,
    stagger: { each: 0.05, grid: [4, 5], from: "random" },
    duration: 0.4,
    ease: "power2.inOut",
    delay: 0.5
  })
})
// Grille de tuiles qui se revelent aleatoirement
```

### 11.3 Line sweep loader
```css
.line-loader {
  position: fixed; inset: 0; z-index: 50;
  background: linear-gradient(90deg, transparent 50%, #000 50%);
  background-size: 200% 100%;
  animation: sweep 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}
@keyframes sweep {
  0% { background-position: 0% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 12. Menu & Navigation Creatives

### 12.1 Fullscreen overlay menu avec stagger
```tsx
function FullscreenMenu({ isOpen }: { isOpen: boolean }) {
  const menuRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (isOpen) {
      gsap.timeline()
        .to(menuRef.current, { clipPath: "circle(150% at top right)", duration: 0.6, ease: "power3.inOut" })
        .from(".menu-link", { y: 80, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power3.out" }, "-=0.2")
    } else {
      gsap.timeline()
        .to(".menu-link", { y: -40, opacity: 0, stagger: 0.05, duration: 0.3 })
        .to(menuRef.current, { clipPath: "circle(0% at top right)", duration: 0.5, ease: "power3.inOut" })
    }
  }, { dependencies: [isOpen] })

  return (
    <div ref={menuRef} className="fixed inset-0 bg-black z-40" style={{ clipPath: "circle(0% at top right)" }}>
      {/* menu-link items */}
    </div>
  )
}
```

### 12.2 Letter shuffle hover
```tsx
function ShuffleLink({ text }: { text: string }) {
  const [display, setDisplay] = useState(text)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

  const handleHover = () => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplay(prev =>
        text.split("").map((char, i) => {
          if (char === " ") return " "
          if (i < iteration) return text[i]
          return chars[Math.floor(Math.random() * chars.length)]
        }).join("")
      )
      iteration += 1 / 2
      if (iteration >= text.length) clearInterval(interval)
    }, 40)
  }

  return <a onMouseEnter={handleHover} className="text-4xl font-bold">{display}</a>
}
```

### 12.3 Expanding menu with cover reveal
```tsx
function ExpandingMenu() {
  useGSAP(() => {
    const links = gsap.utils.toArray<HTMLElement>(".nav-link")
    links.forEach(link => {
      const image = link.querySelector(".nav-image")
      link.addEventListener("mouseenter", () => {
        gsap.to(image, { clipPath: "inset(0%)", duration: 0.4, ease: "power2.out" })
      })
      link.addEventListener("mouseleave", () => {
        gsap.to(image, { clipPath: "inset(50% 50% 50% 50%)", duration: 0.3 })
      })
    })
  })
}
// Chaque lien de navigation revele une image d'arriere-plan au hover
```

---

## 13. Morphing & Clip-Path Transitions

### 13.1 Clip-path morph on scroll
```tsx
useGSAP(() => {
  gsap.to(".morph-shape", {
    clipPath: "circle(75% at 50% 50%)",
    ease: "none",
    scrollTrigger: {
      trigger: ".morph-section",
      start: "top center",
      end: "bottom center",
      scrub: true
    }
  })
})
// CSS initial: .morph-shape { clip-path: circle(5% at 50% 50%); }
```

### 13.2 Button-to-modal morphing
```tsx
function MorphButton() {
  const btnRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const expand = () => {
    const state = Flip.getState(btnRef.current)
    // Repositionner le button en plein ecran
    gsap.set(btnRef.current, {
      position: "fixed", inset: 0, width: "100vw", height: "100vh",
      borderRadius: 0, zIndex: 50
    })
    Flip.from(state, {
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: () => gsap.to(modalRef.current, { opacity: 1, duration: 0.3 })
    })
  }

  return (
    <>
      <button ref={btnRef} onClick={expand} className="px-6 py-3 bg-purple-600 rounded-full">
        En savoir plus
      </button>
      <div ref={modalRef} className="opacity-0">{/* Modal content */}</div>
    </>
  )
}
```

### 13.3 Shape slideshow transition
```css
.slide { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); /* Diamond */ }
.slide.active { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); /* Full rect */ }
.slide { transition: clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1); }
```

---

## 14. Blur & Depth of Field Effects

### 14.1 Motion blur on page transition
```tsx
function transitionWithBlur(href: string) {
  const tl = gsap.timeline()
  tl.to("main", { filter: "blur(10px)", opacity: 0.5, duration: 0.3, ease: "power2.in" })
    .call(() => router.push(href))
    .fromTo("main",
      { filter: "blur(10px)", opacity: 0.5 },
      { filter: "blur(0px)", opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.1 }
    )
}
```

### 14.2 Tilt-shift / depth of field CSS
```css
.depth-scene {
  perspective: 1000px;
}
.depth-layer-bg {
  filter: blur(4px);
  transform: translateZ(-100px) scale(1.1);
}
.depth-layer-mid {
  filter: blur(0px);
  transform: translateZ(0);
}
.depth-layer-fg {
  filter: blur(2px);
  transform: translateZ(50px) scale(0.95);
}
```

### 14.3 Blur text reveal on scroll
```tsx
useGSAP(() => {
  const chars = new SplitType(".blur-text", { types: "chars" })
  gsap.fromTo(chars.chars,
    { filter: "blur(10px)", opacity: 0 },
    {
      filter: "blur(0px)", opacity: 1,
      stagger: 0.03, duration: 0.5,
      scrollTrigger: { trigger: ".blur-text", start: "top 75%" }
    }
  )
})
```

---

## 15. Grain, Noise & Film Effects

### 15.1 CSS grain overlay
```css
.grain::after {
  content: "";
  position: fixed;
  inset: -50%;
  width: 200%; height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.4;
  animation: grain 0.5s steps(8) infinite;
}
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  30% { transform: translate(3%, -15%); }
  50% { transform: translate(12%, 9%); }
  70% { transform: translate(9%, 4%); }
  90% { transform: translate(-1%, 7%); }
}
```

### 15.2 Vignette effect
```css
.vignette::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
}
```

### 15.3 Scanline effect (retro/CRT)
```css
.scanlines::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 10;
}
```

---

## 16. Slideshow & Carousel Avances

### 16.1 WebGL slideshow avec shader transition
```tsx
// Transition entre deux textures via un shader de displacement
const transitionShader = `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform sampler2D uDisp;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    vec4 disp = texture2D(uDisp, vUv);
    float displaceFactor = (disp.r * 2.0 - 1.0) * 0.5;

    vec2 uv1 = vec2(vUv.x, vUv.y + uProgress * displaceFactor);
    vec2 uv2 = vec2(vUv.x, vUv.y - (1.0 - uProgress) * displaceFactor);

    vec4 color1 = texture2D(uTexture1, uv1);
    vec4 color2 = texture2D(uTexture2, uv2);

    gl_FragColor = mix(color1, color2, uProgress);
  }
`
// uProgress va de 0 a 1 pendant la transition
```

### 16.2 Clip-path slideshow
```tsx
function ClipSlideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)
  const shapes = [
    "circle(0% at 50% 50%)",          // Point
    "circle(75% at 50% 50%)",          // Cercle
    "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",  // Diamond
    "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"   // Rectangle
  ]

  const next = () => {
    const el = document.querySelector(".slide-next")
    gsap.fromTo(el,
      { clipPath: shapes[0] },
      { clipPath: shapes[3], duration: 1, ease: "power3.inOut",
        onComplete: () => setCurrent(prev => (prev + 1) % images.length)
      }
    )
  }

  return <div onClick={next}>{/* slides */}</div>
}
```

### 16.3 Parallax slideshow avec inertie
```tsx
useGSAP(() => {
  const slides = gsap.utils.toArray<HTMLElement>(".slide")
  gsap.to(slides, {
    xPercent: -100 * (slides.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: ".slider-container",
      pin: true,
      scrub: 1,
      snap: 1 / (slides.length - 1),
      end: () => "+=" + document.querySelector(".slider-container")!.scrollWidth
    }
  })
})
```

---

## 17. Performance Rules (CRITIQUE)

### Regles critiques
| Regle | Pourquoi |
|-------|----------|
| `will-change: transform` uniquement sur elements animes | Evite la surconsommation GPU |
| `IntersectionObserver` pour lazy-trigger | N'anime que ce qui est visible |
| `transform` et `opacity` seulement | Seules proprietes composites (pas de layout) |
| `requestAnimationFrame` pour animations JS | Sync avec le refresh rate |
| `gsap.ticker` au lieu de `setInterval` | Precision et performance |
| Tree-shake GSAP : `import { ScrollTrigger } from "gsap/ScrollTrigger"` | Bundle minimal |
| `<Canvas dpr={[1, 2]}>` pour R3F | Limite pixel ratio sur mobile |
| Preferer CSS transitions pour les micro-interactions | Plus leger que JS |

### Bundle sizes (reference)
| Lib | Taille gzip |
|-----|-------------|
| GSAP core | ~24KB |
| ScrollTrigger | ~10KB |
| Flip | ~6KB |
| Three.js | ~150KB |
| React Three Fiber | ~35KB |
| Framer Motion | ~32KB |
| Lenis | ~5KB |

---

## 18. Mapping Type de Produit → Animations

| Type de Produit | Animations Recommandees | Intensite |
|-----------------|------------------------|-----------|
| **SaaS / Dashboard** | Reveals au scroll, micro-interactions hover, counters animes | Legere |
| **Landing page** | Parallax hero, scroll storytelling, split text, CTA magnetique, preloader | Moderee |
| **Portfolio / Agence** | WebGL backgrounds, page transitions, hover distortion, custom cursor, grain overlay | Forte |
| **E-commerce** | Grid layout transitions (Flip), image hovers, smooth scroll, slideshow WebGL | Moderee |
| **Blog / Media** | Text reveals, progress bar scroll, image lazy reveals, blur reveal | Legere |
| **App mobile web** | Framer Motion composants, gesture-driven, springs | Moderee |
| **Jeu / Experience** | Three.js full scene, WebGPU shaders, particles, SVG morphing, immersif | Maximale |
| **Corporate / Institutionnel** | Subtle reveals, parallax doux, typo animee, SVG path draw, rien d'excessif | Minimale |
| **Restaurant / Hospitality** | Smooth scroll, image galleries, hover reveals, clip-path slideshows, ambiance | Moderee |
| **Startup / Tech** | Hero 3D, gradient anims, magnetic buttons, grid staggers, fullscreen menu, grain | Forte |

### Quand NE PAS animer
- Sites d'accessibilite critique → respecter `prefers-reduced-motion`
- Applications data-heavy (dashboards complexes) → performance first
- Sites juridiques/medicaux → sobriete professionnelle

```css
/* Toujours inclure */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 19. Reference Codrops

| Categorie | Volume | URL Tag |
|-----------|--------|---------|
| WebGL | 306 demos | tympanus.net/codrops/tag/webgl/ |
| Three.js | 249 demos | tympanus.net/codrops/tag/three-js/ |
| 3D | 210 demos | tympanus.net/codrops/tag/3d/ |
| GSAP | 187 demos | tympanus.net/codrops/tag/gsap/ |
| SVG | 176 demos | tympanus.net/codrops/tag/svg/ |
| Scroll | 165 demos | tympanus.net/codrops/tag/scroll/ |
| Hover | 140 demos | tympanus.net/codrops/tag/hover/ |
| Grid | 135 demos | tympanus.net/codrops/tag/grid/ |
| Page transition | 125 demos | tympanus.net/codrops/tag/page-transition/ |
| Slideshow | 116 demos | tympanus.net/codrops/tag/slideshow/ |
| Distortion | 40 demos | tympanus.net/codrops/tag/distortion/ |
| Morphing | 18 demos | tympanus.net/codrops/tag/morphing/ |
| Particles | 12 demos | tympanus.net/codrops/tag/particles/ |
| Clip-path | 12 demos | tympanus.net/codrops/tag/clip-path/ |
| WebGPU | 9 demos | tympanus.net/codrops/tag/webgpu/ |
| Blur | 8 demos | tympanus.net/codrops/tag/blur/ |
| Cursor | 7 demos | tympanus.net/codrops/tag/cursor/ |
| Loading | 6 demos | tympanus.net/codrops/tag/loading/ |
| Menu/Nav | ~20 demos | tympanus.net/codrops/tag/menu/ |

> Consulter Codrops pour des implementations avancees et de l'inspiration visuelle.
> Les patterns ci-dessus couvrent les fondamentaux implementables directement.

---

*Creative Web Animations - ATUM CREA Knowledge Library (source: Codrops patterns)*
