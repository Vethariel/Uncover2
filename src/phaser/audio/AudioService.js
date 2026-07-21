export class AudioService {
  constructor(game) {
    this.game = game
    this.music = null
    this.overlay = null
    this.sfxVolume = 0.8
    this.musicVolume = 0.5
    this.musicDuckScale = 1
    /** Escala relativa por clave (1 = volumen SFX global). */
    this.sfxGain = {
      mineComplete: 0.55,
      trapDestroyed: 0.7,
      explosion: 0.75,
      puzzleFail: 0.75,
      playerHurt: 0.8,
      fragmentCollected: 0.75,
      enemyHurt: 0.85,
      spiritRage: 0.9,
      golemAggro: 0.35,
      dartHit: 0.85,
    }
  }

  static get(game) {
    if (!game.registry.has('audio')) {
      game.registry.set('audio', new AudioService(game))
    }
    return game.registry.get('audio')
  }

  _destroy(sound) {
    if (!sound) return
    sound.stop()
    sound.destroy()
  }

  _musicTargetVolume() {
    return this.musicVolume * this.musicDuckScale
  }

  _applyMusicVolume() {
    if (this.music) this.music.setVolume(this._musicTargetVolume())
  }

  stopAll() {
    this.musicDuckScale = 1
    this._destroy(this.music)
    this.music = null
    this._destroy(this.overlay)
    this.overlay = null
  }

  playSFX(key, options = {}) {
    if (!this.game.cache.audio.exists(key)) return
    const gain = this.sfxGain[key] ?? 1
    const volumeScale = options.volume ?? 1
    this.game.sound.play(key, {
      volume: this.sfxVolume * gain * volumeScale,
      rate: options.rate ?? 1,
    })
  }

  playMusic(key, loop = true) {
    if (this.music?.key === key && this.music.isPlaying) {
      this._applyMusicVolume()
      return
    }

    this.stopOverlay()
    this._destroy(this.music)

    this.music = this.game.sound.add(key, {
      loop,
      volume: this._musicTargetVolume(),
    })
    this.music.play()
  }

  playOverlayMusic(key, loop = false) {
    if (this.overlay?.key === key && this.overlay.isPlaying) return

    this._destroy(this.overlay)
    this.music?.pause()

    this.overlay = this.game.sound.add(key, { loop, volume: this.musicVolume })
    this.overlay.play()

    if (!loop) {
      this.overlay.once('complete', () => {
        if (this.overlay?.key === key) {
          this.stopOverlay()
        }
      })
    }
  }

  stopOverlay() {
    this._destroy(this.overlay)
    this.overlay = null
  }

  /** Baja el volumen de la BGM (p. ej. pausa) sin detenerla. */
  duckMusic(scale = 0.25) {
    this.musicDuckScale = Math.max(0, Math.min(1, scale))
    this._applyMusicVolume()
  }

  unduckMusic() {
    this.musicDuckScale = 1
    this._applyMusicVolume()
  }

  pauseMusic() {
    this.music?.pause()
  }

  resumeMusic() {
    if (this.music?.isPaused) {
      this.music.resume()
    }
    this._applyMusicVolume()
  }

  stopMusic() {
    this._destroy(this.music)
    this.music = null
  }
}

export function getAudio(scene) {
  return AudioService.get(scene.game)
}
