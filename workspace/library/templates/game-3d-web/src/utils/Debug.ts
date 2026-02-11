import * as THREE from 'three'

export class Debug {
  private renderer: THREE.WebGLRenderer
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 0
  private memory: { used: number; total: number } = { used: 0, total: 0 }

  private container: HTMLDivElement | null = null
  private statsEnabled = true

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer

    if (import.meta.env.DEV) {
      this.createDebugPanel()
    }
  }

  private createDebugPanel(): void {
    this.container = document.createElement('div')
    this.container.id = 'debug-panel'
    this.container.style.cssText = `
      position: fixed;
      top: 60px;
      left: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 4px;
      z-index: 1000;
      pointer-events: none;
      min-width: 150px;
    `
    document.body.appendChild(this.container)
  }

  update(): void {
    this.frameCount++

    const now = performance.now()
    const delta = now - this.lastTime

    // Update FPS every 500ms
    if (delta >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / delta)
      this.frameCount = 0
      this.lastTime = now

      // Update memory if available
      if ('memory' in performance) {
        const memInfo = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
        this.memory = {
          used: Math.round(memInfo.usedJSHeapSize / 1048576),
          total: Math.round(memInfo.totalJSHeapSize / 1048576)
        }
      }

      this.updatePanel()
    }
  }

  private updatePanel(): void {
    if (!this.container || !this.statsEnabled) return

    const info = this.renderer.info
    const render = info.render

    this.container.innerHTML = `
      <div>FPS: ${this.fps}</div>
      <div>Draws: ${render.calls}</div>
      <div>Triangles: ${render.triangles}</div>
      <div>Geometries: ${info.memory.geometries}</div>
      <div>Textures: ${info.memory.textures}</div>
      ${this.memory.total > 0 ? `<div>Memory: ${this.memory.used}/${this.memory.total} MB</div>` : ''}
    `
  }

  getFPS(): number {
    return this.fps
  }

  getMemory(): { used: number; total: number } {
    return this.memory
  }

  getRenderInfo(): THREE.WebGLInfo {
    return this.renderer.info
  }

  enableStats(enabled: boolean): void {
    this.statsEnabled = enabled
    if (this.container) {
      this.container.style.display = enabled ? 'block' : 'none'
    }
  }

  log(message: string, ...args: unknown[]): void {
    if (import.meta.env.DEV) {
      console.log(`[Debug] ${message}`, ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (import.meta.env.DEV) {
      console.warn(`[Debug] ${message}`, ...args)
    }
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[Debug] ${message}`, ...args)
  }

  dispose(): void {
    if (this.container) {
      this.container.remove()
      this.container = null
    }
  }
}

// Performance measurement utilities
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start

  if (import.meta.env.DEV) {
    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`)
  }

  return result
}

export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start

  if (import.meta.env.DEV) {
    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`)
  }

  return result
}
