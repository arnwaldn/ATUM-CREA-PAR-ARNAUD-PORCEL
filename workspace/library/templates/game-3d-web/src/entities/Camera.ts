import * as THREE from 'three'

export type CameraMode = 'follow' | 'orbit' | 'firstPerson'

export interface CameraConfig {
  mode?: CameraMode
  distance?: number
  height?: number
  smoothing?: number
}

export class GameCamera {
  private camera: THREE.PerspectiveCamera
  private target: THREE.Vector3
  private offset: THREE.Vector3
  private mode: CameraMode
  private smoothing: number

  // Orbit mode
  private phi = Math.PI / 4
  private theta = 0
  private distance: number

  // First person
  private pitchObject: THREE.Object3D
  private yawObject: THREE.Object3D

  constructor(camera: THREE.PerspectiveCamera, config: CameraConfig = {}) {
    this.camera = camera
    this.mode = config.mode ?? 'follow'
    this.distance = config.distance ?? 10
    this.smoothing = config.smoothing ?? 0.1

    this.target = new THREE.Vector3()
    this.offset = new THREE.Vector3(0, config.height ?? 5, this.distance)

    // First person setup
    this.pitchObject = new THREE.Object3D()
    this.pitchObject.add(this.camera)
    this.yawObject = new THREE.Object3D()
    this.yawObject.add(this.pitchObject)
  }

  setMode(mode: CameraMode): void {
    this.mode = mode
  }

  setTarget(target: THREE.Vector3): void {
    this.target.copy(target)
  }

  update(delta: number): void {
    switch (this.mode) {
      case 'follow':
        this.updateFollow(delta)
        break
      case 'orbit':
        this.updateOrbit(delta)
        break
      case 'firstPerson':
        this.updateFirstPerson(delta)
        break
    }
  }

  private updateFollow(_delta: number): void {
    const desiredPosition = this.target.clone().add(this.offset)

    // Smooth camera movement
    this.camera.position.lerp(desiredPosition, this.smoothing)
    this.camera.lookAt(this.target)
  }

  private updateOrbit(_delta: number): void {
    // Calculate camera position on sphere
    const x = this.target.x + this.distance * Math.sin(this.phi) * Math.cos(this.theta)
    const y = this.target.y + this.distance * Math.cos(this.phi)
    const z = this.target.z + this.distance * Math.sin(this.phi) * Math.sin(this.theta)

    this.camera.position.set(x, y, z)
    this.camera.lookAt(this.target)
  }

  private updateFirstPerson(_delta: number): void {
    this.camera.position.copy(this.target)
    this.camera.position.y += 1.6 // Eye height
  }

  rotate(deltaX: number, deltaY: number): void {
    if (this.mode === 'orbit') {
      this.theta += deltaX * 0.005
      this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi + deltaY * 0.005))
    } else if (this.mode === 'firstPerson') {
      this.yawObject.rotation.y -= deltaX * 0.002
      this.pitchObject.rotation.x -= deltaY * 0.002
      this.pitchObject.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, this.pitchObject.rotation.x)
      )
    }
  }

  zoom(delta: number): void {
    this.distance = Math.max(2, Math.min(50, this.distance + delta))
    if (this.mode === 'follow') {
      this.offset.z = this.distance
    }
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  getDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3()
    this.camera.getWorldDirection(direction)
    return direction
  }
}
