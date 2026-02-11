import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export interface LoadProgress {
  loaded: number
  total: number
  percent: number
  item: string
}

export class AssetLoader {
  private textureLoader: THREE.TextureLoader
  private gltfLoader: GLTFLoader
  private audioLoader: THREE.AudioLoader
  private cubeTextureLoader: THREE.CubeTextureLoader

  private textures: Map<string, THREE.Texture> = new Map()
  private models: Map<string, GLTF> = new Map()
  private audio: Map<string, AudioBuffer> = new Map()

  private loadingManager: THREE.LoadingManager
  private onProgressCallback?: (progress: LoadProgress) => void

  constructor() {
    this.loadingManager = new THREE.LoadingManager()
    this.setupLoadingManager()

    this.textureLoader = new THREE.TextureLoader(this.loadingManager)
    this.audioLoader = new THREE.AudioLoader(this.loadingManager)
    this.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager)

    // Setup GLTF loader with Draco compression support
    this.gltfLoader = new GLTFLoader(this.loadingManager)
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    this.gltfLoader.setDRACOLoader(dracoLoader)
  }

  private setupLoadingManager(): void {
    this.loadingManager.onProgress = (url, loaded, total) => {
      if (this.onProgressCallback) {
        this.onProgressCallback({
          loaded,
          total,
          percent: (loaded / total) * 100,
          item: url
        })
      }
    }
  }

  onProgress(callback: (progress: LoadProgress) => void): void {
    this.onProgressCallback = callback
  }

  async loadTexture(name: string, url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          this.textures.set(name, texture)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }

  async loadModel(name: string, url: string): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.models.set(name, gltf)
          resolve(gltf)
        },
        undefined,
        reject
      )
    })
  }

  async loadAudio(name: string, url: string): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => {
          this.audio.set(name, buffer)
          resolve(buffer)
        },
        undefined,
        reject
      )
    })
  }

  async loadCubeTexture(name: string, urls: string[]): Promise<THREE.CubeTexture> {
    return new Promise((resolve, reject) => {
      this.cubeTextureLoader.load(
        urls,
        (texture) => {
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }

  async loadAll(manifest: {
    textures?: { name: string; url: string }[]
    models?: { name: string; url: string }[]
    audio?: { name: string; url: string }[]
  }): Promise<void> {
    const promises: Promise<unknown>[] = []

    if (manifest.textures) {
      for (const { name, url } of manifest.textures) {
        promises.push(this.loadTexture(name, url))
      }
    }

    if (manifest.models) {
      for (const { name, url } of manifest.models) {
        promises.push(this.loadModel(name, url))
      }
    }

    if (manifest.audio) {
      for (const { name, url } of manifest.audio) {
        promises.push(this.loadAudio(name, url))
      }
    }

    await Promise.all(promises)
  }

  getTexture(name: string): THREE.Texture | undefined {
    return this.textures.get(name)
  }

  getModel(name: string): GLTF | undefined {
    return this.models.get(name)
  }

  getAudio(name: string): AudioBuffer | undefined {
    return this.audio.get(name)
  }

  cloneModel(name: string): THREE.Object3D | undefined {
    const gltf = this.models.get(name)
    return gltf?.scene.clone()
  }

  dispose(): void {
    this.textures.forEach(texture => texture.dispose())
    this.textures.clear()

    // Models don't have a dispose method, just clear references
    this.models.clear()

    // Audio buffers are managed by the Audio API
    this.audio.clear()
  }
}
