import * as CANNON from 'cannon-es'
import * as THREE from 'three'

export interface PhysicsConfig {
  gravity?: number
  iterations?: number
}

export class PhysicsSystem {
  private world: CANNON.World
  private bodies: Map<number, CANNON.Body> = new Map()
  private meshToBody: Map<THREE.Object3D, CANNON.Body> = new Map()
  private nextId = 0

  constructor(config: PhysicsConfig = {}) {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, config.gravity ?? -9.82, 0)
    })

    // Solver settings
    this.world.solver.iterations = config.iterations ?? 10
    this.world.broadphase = new CANNON.SAPBroadphase(this.world)
    this.world.allowSleep = true

    // Default material
    const defaultMaterial = new CANNON.Material('default')
    const defaultContact = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.3,
        restitution: 0.3
      }
    )
    this.world.addContactMaterial(defaultContact)
    this.world.defaultContactMaterial = defaultContact
  }

  update(delta: number): void {
    // Fixed timestep for physics stability
    const fixedTimeStep = 1 / 60
    const maxSubSteps = 3
    this.world.step(fixedTimeStep, delta, maxSubSteps)
  }

  addGround(): number {
    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: groundShape,
      type: CANNON.Body.STATIC
    })
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.world.addBody(groundBody)

    const id = this.nextId++
    this.bodies.set(id, groundBody)
    return id
  }

  addBox(
    position: THREE.Vector3,
    size: { x: number; y: number; z: number },
    mass = 0
  ): number {
    const shape = new CANNON.Box(
      new CANNON.Vec3(size.x, size.y, size.z)
    )
    const body = new CANNON.Body({
      mass,
      shape,
      position: new CANNON.Vec3(position.x, position.y, position.z)
    })
    this.world.addBody(body)

    const id = this.nextId++
    this.bodies.set(id, body)
    return id
  }

  addSphere(position: THREE.Vector3, radius: number, mass = 1): number {
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
      mass,
      shape,
      position: new CANNON.Vec3(position.x, position.y, position.z)
    })
    this.world.addBody(body)

    const id = this.nextId++
    this.bodies.set(id, body)
    return id
  }

  addPlayer(position: THREE.Vector3): number {
    const shape = new CANNON.Cylinder(0.5, 0.5, 2, 8)
    const body = new CANNON.Body({
      mass: 80,
      shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      fixedRotation: true,
      linearDamping: 0.9
    })
    this.world.addBody(body)

    const id = this.nextId++
    this.bodies.set(id, body)
    return id
  }

  getBody(id: number): CANNON.Body | undefined {
    return this.bodies.get(id)
  }

  syncMesh(mesh: THREE.Object3D, bodyId: number): void {
    const body = this.bodies.get(bodyId)
    if (!body) return

    mesh.position.set(body.position.x, body.position.y, body.position.z)
    mesh.quaternion.set(
      body.quaternion.x,
      body.quaternion.y,
      body.quaternion.z,
      body.quaternion.w
    )
  }

  applyForce(bodyId: number, force: THREE.Vector3): void {
    const body = this.bodies.get(bodyId)
    if (!body) return

    body.applyForce(new CANNON.Vec3(force.x, force.y, force.z))
  }

  applyImpulse(bodyId: number, impulse: THREE.Vector3): void {
    const body = this.bodies.get(bodyId)
    if (!body) return

    body.applyImpulse(new CANNON.Vec3(impulse.x, impulse.y, impulse.z))
  }

  setVelocity(bodyId: number, velocity: THREE.Vector3): void {
    const body = this.bodies.get(bodyId)
    if (!body) return

    body.velocity.set(velocity.x, velocity.y, velocity.z)
  }

  removeBody(id: number): void {
    const body = this.bodies.get(id)
    if (body) {
      this.world.removeBody(body)
      this.bodies.delete(id)
    }
  }

  raycast(
    from: THREE.Vector3,
    to: THREE.Vector3
  ): { hasHit: boolean; hitPoint?: THREE.Vector3; hitNormal?: THREE.Vector3 } {
    const result = new CANNON.RaycastResult()
    const fromVec = new CANNON.Vec3(from.x, from.y, from.z)
    const toVec = new CANNON.Vec3(to.x, to.y, to.z)

    this.world.raycastClosest(fromVec, toVec, {}, result)

    if (result.hasHit) {
      return {
        hasHit: true,
        hitPoint: new THREE.Vector3(
          result.hitPointWorld.x,
          result.hitPointWorld.y,
          result.hitPointWorld.z
        ),
        hitNormal: new THREE.Vector3(
          result.hitNormalWorld.x,
          result.hitNormalWorld.y,
          result.hitNormalWorld.z
        )
      }
    }

    return { hasHit: false }
  }

  dispose(): void {
    this.bodies.forEach((_, id) => this.removeBody(id))
    this.bodies.clear()
    this.meshToBody.clear()
  }
}
