import { Pet } from "./Pet";

export class Chicken extends Pet {

   constructor(scene, x, y, ownGroup, eggGroup) {
      super(scene, x, y, 'mini_chicken');

      this.eggGroup = eggGroup;

      this.IDDLE    = 'IDDLE'
      this.MOVING_1 = 'M1';
      this.EATING   = 'EATING';

      this.state = this.IDDLE;
      this.setOrigin(0.5, 0.9);
      this.health = this.maxHealth = 50;
      this.maxXp = 50;

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

      this.jumpPath = new Phaser.Curves.CubicBezier(
         new Phaser.Math.Vector2(0, 0),
         new Phaser.Math.Vector2(10, 15),
         new Phaser.Math.Vector2(18, 0),
         new Phaser.Math.Vector2(18, 0)
      );

      this.setScale(.10);

      // this.setHealthBar(this.scene.healthChargeBar);
      // this.setXpBar(this.scene.xpChargeBar);

      this.jumpTweenRunningDuration = 100;

      this.jumpTweenRunning = this.scene.tweens.add({
         targets: this.follower,
         t: 1,
         ease: 'Sine.easeInOut',
         duration: () => this.jumpTweenRunningDuration,
         yoyo: false,
         loop: 0,
         loopDelay: 100,
         onLoop: () => (this.follower.t = 0, this.initPosition.x = this.x),
         onComplete: () => (this.state = this.IDDLE, this.waitTimedEvent = false)
      });

      this.initPosition = {
         x: this.x,
         y: this.y
      };

      this.ownGroup = ownGroup;
      this.setInteractive();

      this.evolveTimer = this.scene.time.addEvent({
         delay: 10000,
         // delay: 1000,
         callback: this.increaseXp,
         callbackScope: this,
         repeat: 8
      });

      this.scene.physics.add.existing(this);
      this.body.setSize(90, 100).setOffset(15, 15);
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
                  callback: () => this.jump(Phaser.Math.RND.integerInRange(0, 5)),
                  callbackScope: this
               });
            }

            break;
         case this.MOVING_1:
            this.jumpPath.getPoint(this.follower.t, this.follower.vec);
            this.setPosition(this.initPosition.x + (this.follower.vec.x * this.direction), this.initPosition.y - this.follower.vec.y);

            break;
         case this.EVOLVING:
            if (this.waitTimedEvent)
               return;

            this.body.checkCollision.none = true;

            this.waitTimedEvent = true;
            this.evolveSprite();
            this.sound.play();

            this.scene.time.addEvent({ delay: 100, callback: function () {
               this.scene.tweens.add({
                  targets: this,
                  alpha: 0,
                  duration: 2000,
                  ease: 'Bounce.easeInOut',
                  onComplete: function(tween, targets) {
                     if (targets[0]) {
                        targets[0].kill();
                     }
                  }
               });

               this.scene.pet = new Evo2(this.scene, this.x, this.y);
            }, callbackScope: this });

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

   increaseXp(extraXp = 5) {
      super.increaseXp(extraXp);

      if (this.scaleX >= 0.5) {
         if (this.eggTimer) {
            this.scene.time.addEvent({
               delay: Phaser.Math.RND.integerInRange(1500, 10000),
               callback: this.putEgg,
               args: [false],
               callbackScope: this,
               loop: false
            });
         } else {
            this.eggTimer = this.scene.time.addEvent({
               delay: Phaser.Math.RND.integerInRange(1500, 10000),
               callback: this.putEgg,
               callbackScope: this,
               loop: true
            });
         }
      } else {
         this.setScale(this.scaleX + .05);
      }
   }

   jump(times, direction = Phaser.Math.RND.sign(), velocity = 350) {
      this.direction = direction;
      this.setFlipX(this.direction < 0 ? true : false);
      this.follower.t = 0;
      this.initPosition.x = this.x;
      this.state = this.MOVING_1;
      this.jumpTweenRunningDuration = velocity;

      this.jumpTweenRunning.loop = times;
      this.jumpTweenRunning.play();
   }

   putEgg(changeDelay = true) {
      changeDelay && (this.eggTimer.delay = Phaser.Math.RND.integerInRange(65000, 90000));

      if (this.alive && this.x > 0 && this.x < this.scene.cameras.main.width) {
         this.eggGroup.add(new Egg(this.scene, this.x, this.initPosition.y, this.eggGroup, this.ownGroup));
      }
   }

   doWhenKilled() {
      this.evolveTimer && this.evolveTimer.remove();
      this.eggTimer && this.eggTimer.remove();
      // this.sound.stop();
   }
}
