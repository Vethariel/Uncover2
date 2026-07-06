export function createLevelAssets(scene) {
  return {
    getTMJ(key) {
      return scene.cache.json.get(`tmj_${key}`)
    },
    getTSJ(key) {
      return scene.cache.json.get(`tsj_${key}`)
    },
  }
}
