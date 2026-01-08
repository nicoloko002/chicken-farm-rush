import { Enemy } from "./Enemy";

export class Shark extends Enemy {

   constructor(scene, x, y) {
      super(scene, x, y, 'shark');

      this.scene.anims.create({
         key: 'flying',
         frames: this.scene.anims.generateFrameNumbers(this.texture.key, { start: 0, end: 11, first: 0 }),
         frameRate: 20,
         repeat: -1
      });
      this.play('flying');

      this.health = 4;

      // this.sound = this.scene.sound.add('snakeSound', {
      //    loop: true
      // });
      // this.sound.play();

      this.situation = 'atacking';
      this.atack = {
         min: 1,
         max: 3
      };
   }

   behaviorPattern() {
      // switch (this.state) {
      //    case 'nothing':
      //       this.state = 'M';
      //
      //       this.velocityOriented = Phaser.Math.RND.integerInRange(20, 50);
      //
      //       if (this.x < this.scene.cameras.main.centerX) {
      //          this.body.setVelocityX(this.velocityOriented);
      //          this.play('snake_right');
      //       } else {
      //          this.velocityOriented = -this.velocityOriented;
      //          this.body.setVelocityX(this.velocityOriented);
      //          this.play('snake_left');
      //       }
      //
      //       break;
      // }
   }

   doWhenKilled() {
      this.sound.stop();
   }
}
