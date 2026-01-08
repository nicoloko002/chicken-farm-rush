import { Pet } from "./Pet";
import { EventBus } from "../../../EventBus";

export class Egg extends Pet {

   constructor(scene, x, y, eggGroup, chickenGroup) {
      super(scene, x, y, 'petEgg');

      this.MOVING_1 = 'M1';
      this.MOVING_2 = 'M2';
      this.CRACKING = 'C';

      this.state = this.IDLE;
      this.setOrigin(0.5, 0.9);
      this.rotationTween = 0;
      this.health = this.maxHealth = 50;
      this.maxXp = 1;
      this.setScale(.17);

      var config = {
         key: 'crackingEgg',
         frames: this.scene.anims.generateFrameNumbers('crackingEgg', { start: 0, end: 5, first: 0 }),
         frameRate: 5
      };

      this.scene.anims.create(config);

      this.sound = this.scene.sound.add('crackingEgg');
      this.chickenGroup = chickenGroup;
      this.eggGroup = eggGroup;

      this.setInteractive();
      this.on('pointerup', () => {
         this.kill();
         EventBus.emit('eggClicked', this);
      });
   }

   behaviorPattern() {
      switch(this.state) {
           case this.IDLE:
               if (this.waitTimedEvent)
                  return;

               this.waitTimedEvent = true;
               this.scene.time.addEvent({ delay: 20000, callback: this.changeState, callbackScope: this, args: [this.MOVING_1] });
               // this.scene.time.addEvent({ delay: 1000, callback: this.changeState, callbackScope: this, args: [this.CRACKING] });

               break;
           case this.MOVING_1:
               if (this.waitTimedEvent)
                  return;

               this.timeline = this.scene.tweens.createTimeline();
               this.rotationTween = .1;

               this.timeline.add({
                  targets: this,
                  rotation: () => -this.rotationTween,
                  duration: 500,
                  ease: 'Power2',
                  yoyo: true,
               });

               this.timeline.add({
                  targets: this,
                  rotation: () => this.rotationTween,
                  duration: 500,
                  ease: 'Power2',
                  yoyo: true,
               });

               this.waitTimedEvent = true;
               this.timeline.loop = -1;
               this.timeline.play();

               this.scene.time.addEvent({ delay: 15000, callback: this.changeState, callbackScope: this, args: [this.MOVING_2] });

               break;
           case this.MOVING_2:
               if (this.waitTimedEvent)
                  return;

               this.rotationTween = .2;

               this.waitTimedEvent = true;
               this.scene.time.addEvent({ delay: 10000, callback: this.changeState, callbackScope: this, args: [this.MOVING_3] });

               break;
           case this.MOVING_3:
               if (this.waitTimedEvent)
                  return;

               this.rotationTween = .3;

               this.tweenHResize = this.scene.tweens.add({
                  targets: this,
                  scaleY: {
                     value: () => Phaser.Math.RND.realInRange(.17, .2),
                     duration: 200,
                     ease: 'Power2',
                     yoyo: true,
                     repeat: -1
                  },
                  scaleX: {
                     value: () => Phaser.Math.RND.realInRange(.17, .21),
                     duration: 350,
                     ease: 'Power2',
                     yoyo: true,
                     repeat: -1
                  },
               });

               this.waitTimedEvent = true;
               this.scene.time.addEvent({ delay: 10000, callback: this.changeState, callbackScope: this, args: [this.CRACKING] });

               break;
           case this.CRACKING:
               if (this.waitTimedEvent)
                  return;

               this.body.checkCollision.none = true;

               this.waitTimedEvent = true;
               this.play('crackingEgg');
               this.sound.play();

               this.scene.time.addEvent({ delay: 1500, callback: function () {
                  if (this.scene) {
                     this.scene.tweens.add({
                        targets: this,
                        alpha: 0,
                        duration: 2000,
                        ease: 'linear',
                        onComplete: function(tween, targets) {
                           if (targets[0]) {
                              targets[0].kill();
                           }
                        }
                     });

                     this.chickenGroup.add(new Chicken(this.scene, this.x, this.y, this.chickenGroup, this.eggGroup));
                  }
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
}
