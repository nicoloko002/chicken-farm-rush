import { Enemy } from "./Enemy";
import { EventBus } from "../../../EventBus";

export class Snake extends Enemy {

   constructor(scene, x, y) {
      super(scene, x, y, 'snake');

      this.addMovingLeftAnimation(0, 11, 20);
      this.addMovingRightAnimation(0, 11, 20);

      this.health = 8;
      this.xp = 5;

      this.setScale(.5);

      this.sound = this.scene.sound.add('snakeSound', {
         loop: true
      });
      this.sound.play();

      this.situation = 'atacking';
      this.atack = {
         min: 5,
         max: 10
      };

      this.scene.physics.add.existing(this);

      if (this.x < this.scene.cameras.main.centerX) {
         this.setFlipX(true);
         this.input.hitArea.setTo(20, 15, 140, 70);
         this.body.setSize(40, 80).setOffset(130, 20);
      } else {
         this.input.hitArea.setTo(10, 15, 140, 70);
         this.body.setSize(40, 80).setOffset(30, 20);
      }
   }

   behaviorPattern() {
      switch (this.state) {
         case 'nothing':
            this.state = 'M';

            this.velocityOriented = Phaser.Math.RND.integerInRange(20, 50);

            if (this.x < this.scene.cameras.main.centerX) {
               this.body.setVelocityX(this.velocityOriented);
               this.play('snake_right');
            } else {
               this.velocityOriented = -this.velocityOriented;
               this.body.setVelocityX(this.velocityOriented);
               this.play('snake_left');
            }

            break;
      }
   }

   doWhenKilled() {
      super.doWhenKilled();
      this.sound.stop();
   }
}
