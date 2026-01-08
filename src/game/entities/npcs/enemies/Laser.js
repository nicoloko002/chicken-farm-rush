import Phaser from "phaser";

export class Laser extends Phaser.GameObjects.TileSprite {
   constructor(scene, alien, height, sprite, track) {
      super(scene, 0, 0, 800, height, sprite);

      this.setOrigin(0, 0.5);
      this.alien = alien;
      this.target = null;
      this.visible = false;

      if (track != null)
         this.track = track;
      else
         this.track = false;

      this.sound = this.scene.sound.add('laser', {
         loop: true,
         rate: 1.4
      });

      this.scene.add.existing(this);
    }

   atack(target) {
      this.sound.play();
      this.setVisible(true);
      this.setActive(true);
      this.target = target;

      this.x = this.alien.x;
      this.y = this.alien.y;
      this.rotation = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
   }
}
