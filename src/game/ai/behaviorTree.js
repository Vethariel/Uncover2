export const BT_SUCCESS = 'SUCCESS'
export const BT_FAILURE = 'FAILURE'
export const BT_RUNNING = 'RUNNING'

// Nodo base
export class BTNode {
    tick(enemy, world, blackboard, dt) {
        return BT_FAILURE
    }
}

// Selector — retorna SUCCESS con el primer hijo que tenga éxito (OR)
export class Selector extends BTNode {
    constructor(...children) {
        super()
        this.children = children
    }

    tick(enemy, world, blackboard, dt) {
        for (const child of this.children) {
            const result = child.tick(enemy, world, blackboard, dt)
            if (result !== BT_FAILURE) return result
        }
        return BT_FAILURE
    }
}

// Sequence — retorna FAILURE si algún hijo falla (AND)
export class Sequence extends BTNode {
    constructor(...children) {
        super()
        this.children = children
    }

    tick(enemy, world, blackboard, dt) {
        for (const child of this.children) {
            const result = child.tick(enemy, world, blackboard, dt)
            if (result !== BT_SUCCESS) return result
        }
        return BT_SUCCESS
    }
}

// Inverter — invierte el resultado de su hijo
export class Inverter extends BTNode {
    constructor(child) {
        super()
        this.child = child
    }

    tick(enemy, world, blackboard, dt) {
        const result = this.child.tick(enemy, world, blackboard, dt)
        if (result === BT_SUCCESS) return BT_FAILURE
        if (result === BT_FAILURE) return BT_SUCCESS
        return BT_RUNNING
    }
}

// Repeater — ejecuta su hijo N veces o infinitamente
export class Repeater extends BTNode {
    constructor(child, times = Infinity) {
        super()
        this.child = child
        this.times = times
        this.count = 0
    }

    tick(enemy, world, blackboard, dt) {
        if (this.count >= this.times) {
            this.count = 0
            return BT_SUCCESS
        }
        const result = this.child.tick(enemy, world, blackboard, dt)
        if (result === BT_SUCCESS) this.count++
        return BT_RUNNING
    }
}