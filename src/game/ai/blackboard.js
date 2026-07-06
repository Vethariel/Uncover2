export class Blackboard {

    constructor() {
        this.data = {}
    }

    set(key, value) {
        this.data[key] = value
    }

    get(key) {
        return this.data[key]
    }

    has(key) {
        return key in this.data
    }

    clear(key) {
        delete this.data[key]
    }

}