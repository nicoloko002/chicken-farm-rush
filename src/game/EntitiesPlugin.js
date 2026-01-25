export class EntitiesPlugin extends Phaser.Plugins.ScenePlugin {
  constructor(scene, pluginManager) {
    super(scene, pluginManager);
    this.updateList = new Set();
    this._paused = false;
  }

  boot() {
    this.systems.events.on('update', this.update, this);
    this.systems.events.on('pause', () => this._paused = true);
    this.systems.events.on('resume', () => this._paused = false);
    this.systems.events.once('shutdown', this.shutdown, this);
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
    this.updateList.clear();
    this.systems.events.off('update', this.update, this);
  }
}