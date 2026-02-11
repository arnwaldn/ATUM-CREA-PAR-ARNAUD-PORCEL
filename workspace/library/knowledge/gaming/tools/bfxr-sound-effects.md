# Sound Effects Generation

## Bfxr/jsfxr Presets

```typescript
// Using jsfxr library
import jsfxr from 'jsfxr'

const SOUND_PRESETS = {
  // Coin pickup
  coin: {
    waveType: 1,
    attackTime: 0,
    sustainTime: 0.1,
    sustainPunch: 0.3,
    decayTime: 0.15,
    startFrequency: 0.5,
    minFrequency: 0.2,
    slide: 0.2,
    deltaSlide: 0,
    vibratoDepth: 0,
    vibratoSpeed: 0,
    masterVolume: 0.4
  },

  // Jump
  jump: {
    waveType: 0,
    attackTime: 0,
    sustainTime: 0.1,
    decayTime: 0.1,
    startFrequency: 0.3,
    slide: 0.2,
    vibratoDepth: 0,
    masterVolume: 0.3
  },

  // Explosion
  explosion: {
    waveType: 3, // noise
    attackTime: 0,
    sustainTime: 0.3,
    decayTime: 0.4,
    startFrequency: 0.1,
    slide: -0.1,
    vibratoDepth: 0,
    masterVolume: 0.4
  },

  // Laser
  laser: {
    waveType: 1, // sawtooth
    attackTime: 0,
    sustainTime: 0.05,
    decayTime: 0.2,
    startFrequency: 0.6,
    minFrequency: 0.1,
    slide: -0.3,
    masterVolume: 0.3
  },

  // Hit/Damage
  hit: {
    waveType: 3,
    attackTime: 0,
    sustainTime: 0.05,
    decayTime: 0.1,
    startFrequency: 0.3,
    slide: -0.1,
    masterVolume: 0.4
  },

  // Power-up
  powerup: {
    waveType: 0,
    attackTime: 0,
    sustainTime: 0.2,
    decayTime: 0.2,
    startFrequency: 0.3,
    slide: 0.3,
    vibratoDepth: 0.2,
    vibratoSpeed: 0.5,
    masterVolume: 0.3
  }
}

function playSound(preset: keyof typeof SOUND_PRESETS) {
  const audio = new Audio()
  audio.src = jsfxr(SOUND_PRESETS[preset])
  audio.play()
}
```

## Web Audio API Direct

```typescript
class SoundGenerator {
  private ctx: AudioContext

  constructor() {
    this.ctx = new AudioContext()
  }

  // Simple beep
  beep(frequency: number, duration: number, type: OscillatorType = 'sine') {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = type
    osc.frequency.value = frequency

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + duration)
  }

  // Coin sound (ascending tones)
  coin() {
    const now = this.ctx.currentTime
    ;[800, 1000, 1200].forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'square'
      osc.frequency.value = freq

      const startTime = now + i * 0.05
      gain.gain.setValueAtTime(0.2, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.1)
    })
  }

  // Explosion (noise burst)
  explosion() {
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
    }

    const source = this.ctx.createBufferSource()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    source.buffer = buffer
    filter.type = 'lowpass'
    filter.frequency.value = 1000
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    source.start()
  }
}
```

## Howler.js Integration

```typescript
import { Howl } from 'howler'

class SoundManager {
  private sounds: Map<string, Howl> = new Map()

  // Load from jsfxr data URLs
  loadFromPreset(name: string, preset: object) {
    const dataUrl = jsfxr(preset)
    this.sounds.set(name, new Howl({
      src: [dataUrl],
      volume: 0.5
    }))
  }

  // Preload common sounds
  init() {
    this.loadFromPreset('coin', SOUND_PRESETS.coin)
    this.loadFromPreset('jump', SOUND_PRESETS.jump)
    this.loadFromPreset('hit', SOUND_PRESETS.hit)
    this.loadFromPreset('explosion', SOUND_PRESETS.explosion)
  }

  play(name: string, options?: { volume?: number; rate?: number }) {
    const sound = this.sounds.get(name)
    if (sound) {
      const id = sound.play()
      if (options?.volume) sound.volume(options.volume, id)
      if (options?.rate) sound.rate(options.rate, id)
    }
  }
}
```

## Variations

```typescript
// Add randomization for variety
function playWithVariation(preset: object, variation = 0.1) {
  const modified = { ...preset }

  // Randomize frequency slightly
  modified.startFrequency *= 1 + (Math.random() - 0.5) * variation

  // Randomize pitch
  if (modified.slide) {
    modified.slide *= 1 + (Math.random() - 0.5) * variation
  }

  const audio = new Audio(jsfxr(modified))
  audio.play()
}
```
