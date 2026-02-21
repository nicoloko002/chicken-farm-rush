export class EntitiesPlugin extends Phaser.Plugins.ScenePlugin {
  constructor(scene, pluginManager) {
    super(scene, pluginManager);
    this.updateList = new Set();
    this._paused = false;
  }

  boot() {
    console.log('🟢 Plugin boot() called for scene:', this.scene);
    this.attachListeners();
  }

  attachListeners() {
    this.systems.events.on('update', this.update, this);
    this.systems.events.on('pause', () => (this._paused = true));
    this.systems.events.on('resume', () => (this._paused = false));
    this.systems.events.once('shutdown', () => this.shutdown());
  }

  update(time, delta) {
    if (this._paused) return;

    for (const entity of this.updateList) {
      if (entity.active && entity.update) {
        entity.update(delta);
      }
    }
  }

  add(entity) {
    this.updateList.add(entity);
    return entity;
  }

  remove(entity) {
    this.updateList.delete(entity);
  }

  pause() {
    this._paused = true;
  }

  resume() {
    this._paused = false;
  }

  getAll() {
    return Array.from(this.updateList);
  }

  count() {
    return this.updateList.size;
  }

  shutdown() {
    console.log('🔴 Shutdown called for scene:', this.scene.key);
    this.updateList.clear();
  }
}
