import * as THREE from 'three'

export interface EntityConfig {
  position?: THREE.Vector3
  rotation?: THREE.Euler
  scale?: THREE.Vector3
}

export abstract class Entity {
  protected mesh: THREE.Object3D
  protected velocity: THREE.Vector3
  protected isActive = true

  constructor(mesh: THREE.Object3D, config: EntityConfig = {}) {
    this.mesh = mesh
    this.velocity = new THREE.Vector3()

    if (config.position) {
      this.mesh.position.copy(config.position)
    }
    if (config.rotation) {
      this.mesh.rotation.copy(config.rotation)
    }
    if (config.scale) {
      this.mesh.scale.copy(config.scale)
    }
  }

  abstract update(delta: number): void

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  setPosition(position: THREE.Vector3): void {
    this.mesh.position.copy(position)
  }

  getRotation(): THREE.Euler {
    return this.mesh.rotation.clone()
  }

  setRotation(rotation: THREE.Euler): void {
    this.mesh.rotation.copy(rotation)
  }

  getMesh(): THREE.Object3D {
    return this.mesh
  }

  setActive(active: boolean): void {
    this.isActive = active
    this.mesh.visible = active
  }

  getActive(): boolean {
    return this.isActive
  }

  dispose(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh)
    }

    if (this.mesh instanceof THREE.Mesh) {
      this.mesh.geometry.dispose()
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(m => m.dispose())
      } else {
        this.mesh.material.dispose()
      }
    }
  }
}

export class StaticEntity extends Entity {
  update(_delta: number): void {
    // Static entities don't update
  }
}

export class DynamicEntity extends Entity {
  protected gravity = 9.8
  protected friction = 0.95

  update(delta: number): void {
    if (!this.isActive) return

    // Apply velocity
    this.mesh.position.add(this.velocity.clone().multiplyScalar(delta))

    // Apply friction
    this.velocity.multiplyScalar(this.friction)
  }

  applyForce(force: THREE.Vector3): void {
    this.velocity.add(force)
  }
}
