export class InputSystem {
  private keys: Map<string, boolean> = new Map()
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 }
  private mouseDelta: { x: number; y: number } = { x: 0, y: 0 }
  private mouseButtons: Map<number, boolean> = new Map()
  private element: HTMLElement
  private isPointerLocked = false

  constructor(element: HTMLElement) {
    this.element = element
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Keyboard
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    // Mouse
    this.element.addEventListener('mousedown', this.onMouseDown)
    this.element.addEventListener('mouseup', this.onMouseUp)
    this.element.addEventListener('mousemove', this.onMouseMove)
    this.element.addEventListener('wheel', this.onWheel)

    // Pointer lock
    this.element.addEventListener('click', this.requestPointerLock)
    document.addEventListener('pointerlockchange', this.onPointerLockChange)

    // Prevent context menu
    this.element.addEventListener('contextmenu', e => e.preventDefault())
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys.set(event.code, true)
  }

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.set(event.code, false)
  }

  private onMouseDown = (event: MouseEvent): void => {
    this.mouseButtons.set(event.button, true)
  }

  private onMouseUp = (event: MouseEvent): void => {
    this.mouseButtons.set(event.button, false)
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (this.isPointerLocked) {
      this.mouseDelta.x = event.movementX
      this.mouseDelta.y = event.movementY
    } else {
      this.mousePosition.x = event.clientX
      this.mousePosition.y = event.clientY
    }
  }

  private onWheel = (event: WheelEvent): void => {
    // Can be used for zoom
    event.preventDefault()
  }

  private requestPointerLock = (): void => {
    this.element.requestPointerLock()
  }

  private onPointerLockChange = (): void => {
    this.isPointerLocked = document.pointerLockElement === this.element
  }

  isKeyPressed(code: string): boolean {
    return this.keys.get(code) ?? false
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.get(button) ?? false
  }

  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition }
  }

  getMouseDelta(): { x: number; y: number } {
    const delta = { ...this.mouseDelta }
    this.mouseDelta = { x: 0, y: 0 }
    return delta
  }

  getPointerLocked(): boolean {
    return this.isPointerLocked
  }

  exitPointerLock(): void {
    document.exitPointerLock()
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.element.removeEventListener('mousedown', this.onMouseDown)
    this.element.removeEventListener('mouseup', this.onMouseUp)
    this.element.removeEventListener('mousemove', this.onMouseMove)
    this.element.removeEventListener('click', this.requestPointerLock)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
  }
}
