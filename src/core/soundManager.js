// SoundManager — carga y reproduce sonidos con p5.sound.
// No conoce nada del juego — solo recibe órdenes de play/stop.

export class SoundManager {

    constructor() {
        this.sfx = {}
        this.music = {}
        this.sfxVolume = 0.8
        this.musicVolume = 0.5
        this.currentMusic = null
        this.overlayMusic = null
    }

    // ── Carga ─────────────────────────────────────────────────────────────────

    async load(p) {

        // SFX
        await this._loadSFX(p, "walk", "assets/sounds/walk.wav")
        await this._loadSFX(p, "bombPlace", "assets/sounds/bomb_place.wav")
        await this._loadSFX(p, "explosion", "assets/sounds/explosion.wav")
        await this._loadSFX(p, "powerUp", "assets/sounds/powerup.wav")
        await this._loadSFX(p, "playerDeath", "assets/sounds/player_death.wav")
        await this._loadSFX(p, "enemyDeath", "assets/sounds/enemy_death.wav")
        await this._loadSFX(p, "portalActive", "assets/sounds/portal.wav")

        // Música
        await this._loadMusic(p, "menu", "assets/sounds/music_menu.mp3")
        await this._loadMusic(p, "world1", "assets/sounds/music_world1.mp3")
        await this._loadMusic(p, "victory", "assets/sounds/music_victory.mp3")
        await this._loadMusic(p, "gameOver", "assets/sounds/music_gameover.mp3")
        await this._loadMusic(p, "levelStart", "assets/sounds/music_levelstart.mp3")
        await this._loadMusic(p, "timeUp", "assets/sounds/music_timeUp.mp3")

    }

    async _loadSFX(p, key, path) {
        this.sfx[key] = await p.loadSound(path)
        this.sfx[key].amp(this.sfxVolume)
    }

    async _loadMusic(p, key, path) {
        this.music[key] = await p.loadSound(path)
        this.music[key].amp(this.musicVolume)
    }

    // ── SFX ───────────────────────────────────────────────────────────────────

    playSFX(key) {
        const sound = this.sfx[key]
        if (!sound) return
        if (sound.isPlaying()) sound.stop()
        sound.play()
    }

    // ── Música ────────────────────────────────────────────────────────────────

    playMusic(key, loop = true) {
        const track = this.music[key]
        if (!track) return
        if (this.currentMusic?.isPlaying()) this.currentMusic.stop()
        track.loop(loop)
        track.play()
        this.currentMusic = track
    }

    stopMusic() {
        if (this.currentMusic?.isPlaying()) this.currentMusic.stop()
        this.currentMusic = null
    }

    playOverlayMusic(key, loop = true) {
        const track = this.music[key]
        if (!track) return
        if (this.overlayMusic?.isPlaying()) this.overlayMusic.stop()
        track.loop(loop)
        track.play()
        this.overlayMusic = track
    }

    // ── Volumen ───────────────────────────────────────────────────────────────

    setSFXVolume(v) {
        this.sfxVolume = v
        for (const s of Object.values(this.sfx)) s.amp(v)
    }

    setMusicVolume(v) {
        this.musicVolume = v
        for (const m of Object.values(this.music)) m.amp(v)
    }

    pauseMusic() {
        this.currentMusic.pause()
    }

    resumeMusic() {
        this.currentMusic.play()
        this.currentMusic.paused = false
    }

}