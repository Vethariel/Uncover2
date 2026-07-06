export class EnemyAISystem {

    update(world, dt) {

        for (const enemy of world.enemies) {

            if (!enemy.alive) continue

            enemy.thinkTimer -= dt

            // En EnemyAISystem.update():
            if (enemy.thinkTimer <= 0) {
                enemy.thinkTimer = enemy.thinkInterval
                enemy.behaviorTree?.tick(enemy, world, enemy.blackboard, dt)            
            }

        }

    }

}