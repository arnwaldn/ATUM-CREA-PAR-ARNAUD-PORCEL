import * as THREE from 'three'
import type { PhysicsSystem } from '../systems/PhysicsSystem'
import type { InputSystem } from '../systems/InputSystem'

export class Player {
  private mesh: THREE.Mesh
  private velocity: THREE.Vector3
  private speed = 10
  private jumpForce = 8
  private isGrounded = true
  private physicsBody: number

  constructor(scene: THREE.Scene, physics: PhysicsSystem) {
    // Create player mesh
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8)
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a90d9,
      roughness: 0.3,
      metalness: 0.2
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.set(0, 2, 0)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    this.velocity = new THREE.Vector3()

    // Add to physics
    this.physicsBody = physics.addPlayer(this.mesh.position)
  }

  update(delta: number, input: InputSystem, camera: THREE.Camera): void {
    // Get input direction
    const direction = new THREE.Vector3()

    if (input.isKeyPressed('KeyW') || input.isKeyPressed('ArrowUp')) {
      direction.z -= 1
    }
    if (input.isKeyPressed('KeyS') || input.isKeyPressed('ArrowDown')) {
      direction.z += 1
    }
    if (input.isKeyPressed('KeyA') || input.isKeyPressed('ArrowLeft')) {
      direction.x -= 1
    }
    if (input.isKeyPressed('KeyD') || input.isKeyPressed('ArrowRight')) {
      direction.x += 1
    }

    // Normalize and apply speed
    if (direction.length() > 0) {
      direction.normalize()
      direction.multiplyScalar(this.speed * delta)
    }

    // Apply movement
    this.mesh.position.x += direction.x
    this.mesh.position.z += direction.z

    // Handle jumping
    if ((input.isKeyPressed('Space') || input.isKeyPressed('KeySpace')) && this.isGrounded) {
      this.velocity.y = this.jumpForce
      this.isGrounded = false
    }

    // Apply gravity
    this.velocity.y -= 20 * delta
    this.mesh.position.y += this.velocity.y * delta

    // Ground collision
    if (this.mesh.position.y <= 1) {
      this.mesh.position.y = 1
      this.velocity.y = 0
      this.isGrounded = true
    }

    // Rotate player based on movement
    if (direction.length() > 0) {
      const angle = Math.atan2(direction.x, direction.z)
      this.mesh.rotation.y = angle
    }
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z)
  }

  getMesh(): THREE.Mesh {
    return this.mesh
  }
}
