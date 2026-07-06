// Misma fórmula que el renderSystem original de p5: origin arriba-izquierda, pies alineados al tile.
export function positionEntitySprite(sprite, entity, frameWidth = 32, frameHeight = 32) {
  sprite.setOrigin(0, 0)
  sprite.setPosition(
    Math.floor(entity.posX + (entity.size - frameWidth) / 2),
    Math.floor(entity.posY + (entity.size - frameHeight)),
  )
}
