/** Phaser no soporta tilesets externos (`source: *.tsj`). Embebe el TSJ en el TMJ. */
export function embedTileset(tmj, tsj, textureKey) {
  const map = structuredClone(tmj)

  map.tilesets = map.tilesets.map((entry) => {
    if (!entry.source) return entry

    return {
      firstgid: entry.firstgid,
      ...tsj,
      name: tsj.name,
      image: textureKey,
    }
  })

  return map
}
