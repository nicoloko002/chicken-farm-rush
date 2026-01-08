import Phaser from "phaser";

export class EnemyGroup extends Phaser.Physics.Arcade.Group {
   constructor(scene) {
      super(scene.physics.world, scene);

      this.enemyClasses = [];

      this.timeMin = 0;
      this.timeMax = 0;

      this.rangeXMin = 0;
      this.rangeXMax = 0;

      this.rangeYMin = 0;
      this.rangeYMax = 0;
   }

   setEnemyClasses(enemyClasses) {
      this.enemyClasses = enemyClasses;
   }

   addEnemyClass(enemyClass) {
      this.enemyClasses.push(enemyClass);
   }

   setTimeInterval(tMin, tMax) {
      this.timeMin = tMin;
      this.timeMax = tMax;
   }

   setRangeX(min, max) {
      this.rangeXMin = min;
      this.rangeXMax = max;
   }

   setRangeY(min, max) {
      this.rangeYMin = min;
      this.rangeYMax = max;
   }

   start() {
      if (this.timer) {

      } else {
         this.timer = this.scene.time.addEvent({
            repeat: -1,
            delay: Phaser.Math.RND.integerInRange(this.timeMin, this.timeMax),
            callback: this.createRandomEnemy,
            callbackScope: this
         });
      }
   }

   stop() {
      this.timer.remove();
      this.timer = null;
   }

   createRandomEnemy(enemyClass) {
      this.timer.delay = Phaser.Math.RND.integerInRange(this.timeMin, this.timeMax);
      return this.createEnemy(this.randomEnemySprite());
   }

   createEnemy(enemyClass) {
      var enemy = new enemyClass(this.scene, this.getRandomX(), this.getRandomY())

      this.scene.physics.add.existing(enemy);
      this.add(enemy);

      return enemy;
   }

   randomEnemySprite() {
      return this.enemyClasses[Math.floor(Math.random() * this.enemyClasses.length)];
   }

   getRandomX() {
      return Phaser.Math.RND.integerInRange(this.rangeXMin, this.rangeXMax);
   }

   getRandomY() {
      return Phaser.Math.RND.integerInRange(this.rangeYMin, this.rangeYMax);
   }
   //
   // preUpdate(time, delta) {
   //    this.children.each(this.overlapsBoundaries);
   //
   //    super.preUpdate(time, delta);
   // }

   // removeSprite(sprite) {
   //    this.enemyClasses
   // }
}
