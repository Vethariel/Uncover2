export function createLevelAssets(scene) {
  return {
    getTMJ(key) {
      return scene.cache.tilemap.get(`map_${key}`).data
    },
    getTSJ(key) {
      return scene.cache.json.get(`tsj_${key}`)
    },
  }
}
