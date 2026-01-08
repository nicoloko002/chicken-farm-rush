import { Enemy } from "./Enemy";
import { EventBus } from "../../../EventBus";

export class Alien extends Enemy {
   constructor(scene, x, y) {
      super(scene, x, y, 'alien');

      this.ESPECIAL_ATACK = 'EA';
      this.ESCAPE = 'ESCAPE';
      this.health = this.maxHealth = 9999;

      this.atack = {
         min: 999,
         max: 999
      };

      var config = {
         key: 'alien',
         frames: this.scene.anims.generateFrameNumbers('alien', { start: 0, end: 4, first: 0 }),
         frameRate: 15,
         repeat: -1,
         yoyo: true
      };

      this.scene.anims.create(config);
      this.play('alien');

      // this.specialAtack = new Laser(this.scene, this, 30, 'laser');
      this.scene.add.existing(this);

      this.on('pointerup', () => EventBus.emit('enemy-clicked', this));
   }

   behaviorPattern() {
      switch (this.state) {
         case 'nothing':
            this.y += 1;

            if (this.y >= 180) {
               this.state = this.ESPECIAL_ATACK;
            }

            break;
         case this.ESPECIAL_ATACK:

            // this.scene.time.addEvent({ delay: 10000, callback: function () {
               // this.specialAtack.atack(this.scene.pet);
               // doDamage(this.atack, this.scene.pet);
               // this.scene.music.stop();
               // this.scene.music = this.scene.sound.add('alienMusic');
               // this.scene.music.play();

               // this.scene.sorry();
            // }, callbackScope: this });
            this.chickenCapturator();

            this.state = 'iddle';

            break;
         case this.ESCAPE:
            this.y -= 5.0;
            break;
      }
   }

   chickenCapturator() {
      var evolveLight = this.scene.add.sprite(this.x, this.y, 'evolve');
      evolveLight.setScale(0.1, 1.5);
      evolveLight.setOrigin(0.5, 0);
      evolveLight.setAlpha(0);
      capturatorGroup.add(evolveLight);
      // this.scene.input.enableDebug(evolveLight);

      var timeline = this.scene.tweens.createTimeline();

      timeline.add({
         targets: evolveLight,
         scaleX: .7,
         alpha: 1,
         duration: 3000,
         ease: 'linear'
      });

      timeline.add({
         targets: evolveLight,
         scaleX: .75,
         alpha: .8,
         duration: 200,
         ease: 'linear',
         yoyo: true,
         repeat: 30
      });

      timeline.add({
         targets: evolveLight,
         scaleX: 0,
         duration: 500,
         ease: 'linear',
         onComplete: (tween, targets) => {
            if (targets[0]) {
               targets[0].destroy();
            }

            this.state = this.ESCAPE;
         }
      });

      timeline.play();
   }

   murdered() {
      if (!this.scene.endGameReached) {
         this.scene.endGame();
      }
   }
}
