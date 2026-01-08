import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class Frog extends Enemy {

   constructor(scene, x, y) {
      super(scene, x, y, 'frog');

      this.IDDLE    = 'IDDLE'
      this.MOVING_1 = 'M1';
      this.EATING   = 'EATING';

      this.state = this.IDDLE;
      this.setOrigin(0.5, 0.9);
      this.health = this.maxHealth = 50;

      this.scene.physics.add.existing(this);
      this.canEat = true;

      this.atack = {
         min: 1,
         max: 1,
         animation: 'bite',
         sound: 'bite'
      }

      this.follower = {
         t: 0,
         vec: new Phaser.Math.Vector2()
      };

      this.normalJumpPath = new Phaser.Curves.CubicBezier(
         new Phaser.Math.Vector2(0, 0),
         new Phaser.Math.Vector2(30, 50),
         new Phaser.Math.Vector2(60, 0),
         new Phaser.Math.Vector2(60, 0)
      );

      this.setScale(.5);

      // this.setHealthBar(this.scene.healthChargeBar);
      // this.setXpBar(this.scene.xpChargeBar);


      this.jumpTweenRunningDuration = 100;

      this.jumpTweenRunning = this.scene.tweens.add({
         targets: this.follower,
         t: 1,
         ease: 'Sine.easeInOut',
         duration: () => this.jumpTweenRunningDuration,
         onComplete: () => (this.state = this.IDDLE, this.waitTimedEvent = false)
      });

      this.initPosition = {
         x: this.x,
         y: this.y
      };

      this.setInteractive();
      this.scene.physics.add.existing(this);

      if (this.x < this.scene.cameras.main.centerX) {
         this.direction = 1;
         this.body.setSize(70, 80).setOffset(80, 20);
      } else {
         this.direction = -1;
         this.setFlipX(true);
         this.body.setSize(70, 80).setOffset(0, 20);
      }

      this.on('pointerup', () => EventBus.emit('enemy-clicked', this));
   }

   behaviorPattern() {
      switch(this.state) {
         case this.IDDLE:
            if (this.waitTimedEvent)
               return;

            if (!this.jumpTweenRunning.isPlaying()) {
               this.waitTimedEvent = true;
               this.iddleTimer = this.scene.time.addEvent({
                  delay: Phaser.Math.RND.integerInRange(1500, 3000),
                  callback: () => this.longJump(),
                  callbackScope: this
               });
            }

            break;
         case this.MOVING_1:
            this.normalJumpPath.getPoint(this.follower.t, this.follower.vec);
            this.setPosition(this.initPosition.x + (this.follower.vec.x * this.direction), this.initPosition.y - this.follower.vec.y);
            break;
         case this.MOVING_2:
            this.longJumpPath.getPoint(this.follower.t, this.follower.vec);
            this.setPosition(this.initPosition.x + (this.follower.vec.x * this.direction), this.initPosition.y - this.follower.vec.y);
            break;
      }
   }

   changeState(state) {
      this.waitTimedEvent = false;
      this.state = state;
   }

   preUpdate(time, delta) {
      super.preUpdate(time, delta);
   }

   increaseXp(extraXp) {
      super.increaseXp(extraXp);

      this.setScale(.3 + (this.xp * .005));
   }

   normalJump(direction) {
      this.direction = direction || this.direction;
      this.follower.t = 0;
      this.initPosition.x = this.x;
      this.jumpTweenRunningDuration = 500;
      this.jumpTweenRunning.play();
      this.state = this.MOVING_1;
   }

   longJump(direction) {
      this.direction = direction || this.direction;
      this.initPosition.x = this.x;
      let maxX = Phaser.Math.RND.integerInRange(200, 500),
          maxY = Phaser.Math.RND.integerInRange(300, 800);

      this.jumpTweenRunningDuration = ((maxX + maxY) * 500) / (60 + 50);

      this.longJumpPath = new Phaser.Curves.CubicBezier(
         new Phaser.Math.Vector2(0, 0),
         new Phaser.Math.Vector2(maxX / 2, maxY),
         new Phaser.Math.Vector2(maxX, 0),
         new Phaser.Math.Vector2(maxX, 0)
      );

      this.jumpTweenRunning.play();
      this.state = this.MOVING_2;
   }
}
