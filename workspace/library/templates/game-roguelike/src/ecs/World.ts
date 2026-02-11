import type { Component } from './Component'

export class World {
  private entities: Set<number> = new Set()
  private components: Map<string, Map<number, Component>> = new Map()
  private nextEntityId = 0

  createEntity(): number {
    const id = this.nextEntityId++
    this.entities.add(id)
    return id
  }

  destroyEntity(entity: number): void {
    this.entities.delete(entity)
    this.components.forEach(componentMap => {
      componentMap.delete(entity)
    })
  }

  addComponent<T extends Component>(entity: number, component: T): void {
    const type = component.type
    if (!this.components.has(type)) {
      this.components.set(type, new Map())
    }
    this.components.get(type)!.set(entity, component)
  }

  removeComponent(entity: number, type: string): void {
    this.components.get(type)?.delete(entity)
  }

  getComponent<T extends Component>(entity: number, type: string): T | undefined {
    return this.components.get(type)?.get(entity) as T | undefined
  }

  hasComponent(entity: number, type: string): boolean {
    return this.components.get(type)?.has(entity) ?? false
  }

  query(componentTypes: string[]): number[] {
    const result: number[] = []
    this.entities.forEach(entity => {
      const hasAll = componentTypes.every(type => this.hasComponent(entity, type))
      if (hasAll) result.push(entity)
    })
    return result
  }

  getEntities(): number[] {
    return Array.from(this.entities)
  }

  clear(): void {
    this.entities.clear()
    this.components.clear()
    this.nextEntityId = 0
  }
}
