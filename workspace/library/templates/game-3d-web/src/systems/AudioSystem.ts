import { Howl, Howler } from 'howler'

export interface SoundConfig {
  src: string | string[]
  volume?: number
  loop?: boolean
  spatial?: boolean
  rate?: number
}

export interface MusicConfig {
  src: string | string[]
  volume?: number
  fadeIn?: number
}

export class AudioSystem {
  private sounds: Map<string, Howl> = new Map()
  private music: Howl | null = null
  private masterVolume = 1
  private sfxVolume = 1
  private musicVolume = 0.5
  private muted = false

  constructor() {
    // Set global volume
    Howler.volume(this.masterVolume)
  }

  loadSound(name: string, config: SoundConfig): void {
    const sound = new Howl({
      src: Array.isArray(config.src) ? config.src : [config.src],
      volume: (config.volume ?? 1) * this.sfxVolume,
      loop: config.loop ?? false,
      rate: config.rate ?? 1,
      preload: true
    })

    this.sounds.set(name, sound)
  }

  playSound(name: string, volume?: number): number | undefined {
    const sound = this.sounds.get(name)
    if (!sound) {
      console.warn(`Sound "${name}" not found`)
      return undefined
    }

    if (volume !== undefined) {
      sound.volume(volume * this.sfxVolume)
    }

    return sound.play()
  }

  stopSound(name: string): void {
    const sound = this.sounds.get(name)
    sound?.stop()
  }

  playMusic(config: MusicConfig): void {
    // Stop current music
    this.stopMusic()

    this.music = new Howl({
      src: Array.isArray(config.src) ? config.src : [config.src],
      volume: 0,
      loop: true,
      preload: true,
      onload: () => {
        this.music?.play()
        this.music?.fade(0, (config.volume ?? 1) * this.musicVolume, config.fadeIn ?? 1000)
      }
    })
  }

  stopMusic(fadeOut = 1000): void {
    if (this.music) {
      this.music.fade(this.music.volume(), 0, fadeOut)
      setTimeout(() => {
        this.music?.stop()
        this.music?.unload()
        this.music = null
      }, fadeOut)
    }
  }

  pauseMusic(): void {
    this.music?.pause()
  }

  resumeMusic(): void {
    this.music?.play()
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    Howler.volume(this.masterVolume)
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach(sound => {
      sound.volume(this.sfxVolume)
    })
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.music) {
      this.music.volume(this.musicVolume)
    }
  }

  mute(): void {
    this.muted = true
    Howler.mute(true)
  }

  unmute(): void {
    this.muted = false
    Howler.mute(false)
  }

  toggleMute(): void {
    if (this.muted) {
      this.unmute()
    } else {
      this.mute()
    }
  }

  isMuted(): boolean {
    return this.muted
  }

  // Spatial audio support
  playSpatialSound(
    name: string,
    position: { x: number; y: number; z: number }
  ): number | undefined {
    const sound = this.sounds.get(name)
    if (!sound) return undefined

    const id = sound.play()
    sound.pos(position.x, position.y, position.z, id)
    return id
  }

  updateSoundPosition(
    name: string,
    soundId: number,
    position: { x: number; y: number; z: number }
  ): void {
    const sound = this.sounds.get(name)
    sound?.pos(position.x, position.y, position.z, soundId)
  }

  setListenerPosition(position: { x: number; y: number; z: number }): void {
    Howler.pos(position.x, position.y, position.z)
  }

  setListenerOrientation(
    forward: { x: number; y: number; z: number },
    up: { x: number; y: number; z: number }
  ): void {
    Howler.orientation(
      forward.x, forward.y, forward.z,
      up.x, up.y, up.z
    )
  }

  dispose(): void {
    this.sounds.forEach(sound => {
      sound.unload()
    })
    this.sounds.clear()

    if (this.music) {
      this.music.unload()
      this.music = null
    }
  }
}
