import { Person } from "../../Person";

export class Pet extends Person {

   constructor(scene, x, y, sprite) {
      super(scene, x, y, sprite);

      this.EVOLVING = 'E';

      this.atackDelay = 500;
      this.atackSpeed = 1000;

      this.xp = 0;


      // this.powerBar = new ChargeBar(this, 30, 20, 'chargeBarPowerFill', 'chargeBarPowerIcon');
      // this.uiGroup.add(this.powerBar);
      //
      // this.healthChargeBar = new ChargeBar(this, 30, 60, 'chargeBarHealthFill', 'chargeBarHealthIcon');
      // this.uiGroup.add(this.healthChargeBar);
      // this.pet.setHealthBar(this.healthChargeBar);
      //
      // this.xpChargeBar = new ChargeBar(this, 30, 100, 'chargeBarXpFill', 'chargeBarXpIcon');
      // this.uiGroup.add(this.xpChargeBar);
      // this.pet.setXpBar(this.xpChargeBar);
   }

   setHealthBar(healthBar) {
      this.healthBar = healthBar;
   }

   setXpBar(xpBar) {
      this.xpBar = xpBar;
   }

   preUpdate(time, delta) {
      super.preUpdate(time, delta);

      if (this.healthBar)
         this.healthBar.update(this.health, this.maxHealth);

      if (this.xpBar)
         this.xpBar.update(this.xp, this.maxXp);
   }

   increaseXp(extraXp) {
      if (this.xp < this.maxXp) {
         this.xp += extraXp;

         if (this.xp >= this.maxXp) {
            // this.changeState(this.EVOLVING);
         }
      }
   }

   doWhenKilled() {
      // this.healthBar.area.width = 0;
      // this.healthBar.charge.setCrop(this.healthBar.area);
   }

   murdered() {
      if (!this.scene.endGameReached) {
         this.scene.lostGame();
      }
   }

   evolveSprite() {
      var evolveLight = this.scene.add.sprite(this.x, this.y, 'evolve');
      evolveLight.setOrigin(0.5, 0.75);
      evolveLight.setScale(0.1, 1);

      var timeline = this.scene.tweens.createTimeline();

      timeline.add({
         targets: evolveLight,
         scaleX: 1,
         duration: 600,
         ease: 'linear'
      });

      timeline.add({
         targets: evolveLight,
         alpha: 0,
         duration: 1000,
         ease: 'linear',
         onComplete: function (tween, targets) {
            if (targets[0]) {
               targets[0].destroy();
            }
         }
      });

      timeline.play();
   }
}
