import Phaser from "phaser";

export class ChargeBar extends Phaser.GameObjects.Container {
   constructor(scene, x, y, chargeSprite, iconSprite) {
      super(scene, x, y);

      this.charge = new Phaser.GameObjects.Sprite(scene, 5, 5, chargeSprite);
      this.charge.setOrigin(0.01, 0.15);

      // if (glowSprite != null) {
      //    this.glowSprite = new Phaser.GameObjects.Sprite(scene, this.charge.position.x + this.charge.width / 2, this.charge.position.y + this.charge.height / 2, glowSprite);
      //    this.glowSprite.setOrigin(0, 0);
      //    this.glowSprite.alpha = 0;
      //    this.add(this.glowSprite);
      //
      //    this.glowTween = this.scene.add.tween(this.glowSprite).to({
      //       alpha: 1
      //    }, 200, Phaser.Easing.Default, true, 0, Number.MAX_VALUE, true);
      //    this.glowTween.pause();
      // }

      this.background = new Phaser.GameObjects.Sprite(scene, 0, 0, 'chargeBarBackground');
      this.background.setOrigin(0, 0);
      this.background.width = this.charge.width + 10;
      this.background.height = this.charge.height + 10;
      this.add(this.background);

      // this.charge.anchor.set(0.5);
      this.add(this.charge);

      this.maxValue = this.charge.width;
      this.area = new Phaser.Geom.Rectangle(0, 0, 0, this.charge.height);

      this.charge.setCrop(this.area);

      this.incValue = 1;
      this.canIncrease = true;

      if (iconSprite) {
         var center = this.background.getCenter();
         this.iconContainer = new Phaser.GameObjects.Container(scene, 0, center.y);
         var iconBackground = new Phaser.GameObjects.Sprite(scene, 0, 0, 'chargeBarIconBackground');
         this.iconContainer.add(iconBackground);
         this.iconContainer.add(new Phaser.GameObjects.Sprite(scene, 0, 0, iconSprite));
         this.add(this.iconContainer);
      }

      this.scene.add.existing(this);
   }

   setBorder(value) {
      this.background.width = this.charge.width + value;
      this.background.height = this.charge.height + value;

      this.charge.position.setTo(value / 2, value / 2);
   }

   setIncValue(incValue) {
      this.incValue = incValue;
   }

   inc() {
      if (this.area.width + this.incValue > this.maxValue) {
         this.area.width = this.maxValue;
      } else {
         this.area.width += this.incValue;
      }

      this.charge.setCrop(this.area);
   }

   dec() {
      if (this.area.width - this.incValue < 0) {
         this.area.width
      } else {
         this.area.width -= this.incValue;
      }

      this.charge.setCrop(this.area);
   }

   reset() {
      this.area.width = 0;
      this.charge.updateCrop();

      if (this.glowTween != null) {
         this.glowTween.pause();

         this.glowSprite.alpha = 0;
      }
   }

   chargedPercentage() {
      return this.area.width / this.maxValue * 100;
   }

   preUpdate(time, delta) {
      if (this.area.width > this.maxValue) {
         this.area.width = this.maxValue;

         if (this.glowTween) {
            this.glowTween.resume();
         }
      }
   }

   update(current, max) {
      this.area.width += Math.sign(((current * this.maxValue) / max) - this.area.width) * this.incValue;
      this.charge.setCrop(this.area);
   }

}
