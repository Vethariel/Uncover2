export class AssetManager {

    constructor() {
        this.sheets = {}
        this.tmjs = {}
        this.tsjs = {}
    }

    async loadSheet(key, path, p) {
        this.sheets[key] = await p.loadImage(path)
    }

    async loadTMJ(key, path) {
        const res = await fetch(path)
        if (!res.ok) throw new Error(`AssetManager.loadTMJ: no se pudo cargar "${path}" (${res.status})`)
        this.tmjs[key] = await res.json()
    }

    async loadTSJ(key, path) {
        const res = await fetch(path)
        if (!res.ok) throw new Error(`AssetManager.loadTSJ: no se pudo cargar "${path}" (${res.status})`)
        this.tsjs[key] = await res.json()
    }

    get(key) {
        return this.sheets[key]
    }

    getTMJ(key) {
        return this.tmjs[key]
    }

    getTSJ(key) {
        return this.tsjs[key]
    }

}