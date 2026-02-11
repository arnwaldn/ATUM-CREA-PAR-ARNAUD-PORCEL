import * as THREE from 'three'
import { InputSystem } from './systems/InputSystem'
import { PhysicsSystem } from './systems/PhysicsSystem'
import { AudioSystem } from './systems/AudioSystem'
import { Player } from './entities/Player'
import { AssetLoader } from './utils/AssetLoader'
import { Debug } from './utils/Debug'

export class Game {
  private container: HTMLElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private clock: THREE.Clock

  private inputSystem: InputSystem
  private physicsSystem: PhysicsSystem
  private audioSystem: AudioSystem
  private assetLoader: AssetLoader
  private debug: Debug | null = null

  private player: Player | null = null
  private isRunning = false
  private score = 0

  private readyCallbacks: (() => void)[] = []

  constructor(container: HTMLElement) {
    this.container = container
    this.clock = new THREE.Clock()

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1
    container.appendChild(this.renderer.domElement)

    // Initialize scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87ceeb)
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200)

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 5, 10)

    // Initialize systems
    this.inputSystem = new InputSystem(this.renderer.domElement)
    this.physicsSystem = new PhysicsSystem()
    this.audioSystem = new AudioSystem()
    this.assetLoader = new AssetLoader()

    // Debug mode in development
    if (import.meta.env.DEV) {
      this.debug = new Debug(this.renderer)
    }
  }

  async start(): Promise<void> {
    await this.init()
    this.isRunning = true
    this.animate()
  }

  private async init(): Promise<void> {
    // Setup lighting
    this.setupLighting()

    // Create ground
    this.createGround()

    // Create player
    this.player = new Player(this.scene, this.physicsSystem)

    // Setup camera to follow player
    this.camera.position.set(0, 5, 10)
    this.camera.lookAt(0, 0, 0)

    // Add some objects to the scene
    this.createEnvironment()

    // Notify ready
    this.readyCallbacks.forEach(cb => cb())
  }

  private setupLighting(): void {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambient)

    // Directional light (sun)
    const sun = new THREE.DirectionalLight(0xffffff, 1)
    sun.position.set(50, 100, 50)
    sun.castShadow = true
    sun.shadow.mapSize.width = 2048
    sun.shadow.mapSize.height = 2048
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 500
    sun.shadow.camera.left = -50
    sun.shadow.camera.right = 50
    sun.shadow.camera.top = 50
    sun.shadow.camera.bottom = -50
    this.scene.add(sun)

    // Hemisphere light for sky/ground color blend
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x98fb98, 0.3)
    this.scene.add(hemi)
  }

  private createGround(): void {
    const groundGeometry = new THREE.PlaneGeometry(200, 200)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a5f0b,
      roughness: 0.8,
      metalness: 0.1
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    // Add ground to physics
    this.physicsSystem.addGround()
  }

  private createEnvironment(): void {
    // Add some cubes as obstacles
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      roughness: 0.4,
      metalness: 0.1
    })

    for (let i = 0; i < 10; i++) {
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      cube.position.set(
        (Math.random() - 0.5) * 40,
        1,
        (Math.random() - 0.5) * 40
      )
      cube.castShadow = true
      cube.receiveShadow = true
      this.scene.add(cube)

      this.physicsSystem.addBox(cube.position, { x: 1, y: 1, z: 1 })
    }
  }

  private animate = (): void => {
    if (!this.isRunning) return

    requestAnimationFrame(this.animate)

    const delta = this.clock.getDelta()

    // Update systems
    this.physicsSystem.update(delta)

    // Update player
    if (this.player) {
      this.player.update(delta, this.inputSystem, this.camera)

      // Update camera to follow player
      const playerPos = this.player.getPosition()
      this.camera.position.x = playerPos.x
      this.camera.position.z = playerPos.z + 10
      this.camera.lookAt(playerPos.x, playerPos.y, playerPos.z)
    }

    // Update debug stats
    this.debug?.update()

    // Render
    this.renderer.render(this.scene, this.camera)

    // Update FPS display
    this.updateUI()
  }

  private updateUI(): void {
    const fpsElement = document.getElementById('fps')
    if (fpsElement && this.debug) {
      fpsElement.textContent = `FPS: ${this.debug.getFPS()}`
    }

    const scoreElement = document.getElementById('score')
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score}`
    }
  }

  resize(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }

  onReady(callback: () => void): void {
    this.readyCallbacks.push(callback)
  }

  addScore(points: number): void {
    this.score += points
  }

  getScore(): number {
    return this.score
  }

  pause(): void {
    this.isRunning = false
  }

  resume(): void {
    this.isRunning = true
    this.clock.getDelta() // Reset delta
    this.animate()
  }

  dispose(): void {
    this.isRunning = false
    this.inputSystem.dispose()
    this.physicsSystem.dispose()
    this.audioSystem.dispose()
    this.renderer.dispose()
  }
}
