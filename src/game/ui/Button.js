import Phaser from "phaser";

export class Button extends Phaser.GameObjects.Container {
   constructor(scene, x, y, iconSprite, backgroundSprite, chargeSprite, triggerKey, cost, cursor) {
      super(scene, x, y);
      this.cursor = cursor;

      this.setScale(.5);

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
      this.bgButton = new Phaser.GameObjects.Sprite(scene, 0, 0, backgroundSprite);
      this.bgButton.setOrigin(0, 0);
      this.add(this.bgButton);

      if (chargeSprite) {
         this.charge = new Phaser.GameObjects.Sprite(scene, 0, 0, chargeSprite);
         this.charge.setScale(.5);
         this.charge.setOrigin(0.01, 0.15);

         this.background = new Phaser.GameObjects.Sprite(scene, 18 - 5, 100 - 5, 'chargeBarBackground');
         this.background.setScale(.5);
         this.background.setOrigin(0, 0);
         this.background.width = this.charge.width + 10;
         this.background.height = this.charge.height + 10;
         this.add(this.background);

         this.charge.setPosition(this.background.x + 5, this.background.y + 5);
         this.add(this.charge);

         this.maxValue = this.charge.width;
         this.area = new Phaser.Geom.Rectangle(0, 0, 0, this.charge.height);

         this.charge.setCrop(this.area);
      }

      // this.charge.anchor.set(0.5);



      this.incValue = 1;
      this.canIncrease = this.charge ? true : false;

      var center = this.bgButton.getCenter();
      this.icon = new Phaser.GameObjects.Sprite(scene, center.x - 5, center.y - 10, iconSprite);
      this.add(this.icon);

      this.scene.add.existing(this);
      this.bgButton.setInteractive();

      this.text = this.scene.add.text(8, 8, triggerKey, {
         fontSize: 20,
         strokeThickness: 1
      });

      this.add(this.text);

      if (cost) {
         this.egg = this.scene.add.sprite(15, 120, 'petEgg');
         this.egg.setScale(.13);
         this.add(this.egg);

         this.cost = this.scene.add.text(25, 115, 'x' + cost, {
            fontSize: 18,
            strokeThickness: .5
         });
         this.add(this.cost);
      }

      this.bgButton.on('pointerover', () => {
         this.text.setPosition(8 + 5, 8 + 5);
         this.icon.setPosition(center.x, center.y - 5);
         this.bgButton && this.bgButton.setFrame(1);
         this.background && this.background.setPosition(18, 100);
         this.charge && this.charge.setPosition(this.background.x + 5, this.background.y + 5);
         this.cost && this.cost.setPosition(25 + 5, 115 + 5);
      });
      this.bgButton.on('pointerout', this.deselect, this);

      this.scene.input.keyboard.on('keydown-' + triggerKey, this.buttonDown, this);
      this.bgButton.on('pointerdown', this.buttonDown, this);

      this.triggerKey = triggerKey;
   }

   deselect() {
      if (this.scene.selectedPointer != this.triggerKey) {
         this.text.setPosition(8, 8);
         this.icon.setPosition(this.bgButton.getCenter().x - 5, this.bgButton.getCenter().y - 10);
         this.bgButton.setFrame(0);
         this.background && this.background.setPosition(18 - 5, 100 - 5);
         this.charge && this.charge.setPosition(this.background.x + 5, this.background.y + 5);
         this.cost && this.cost.setPosition(25, 115);
      } else {
         this.bgButton.emit('pointerover');
      }
   }

   buttonDown(pointer, localx, localy, event) {
      event && event.stopPropagation();

      this.text.setPosition(8 + 5, 8 + 5);
      this.icon.setPosition(this.bgButton.getCenter().x, this.bgButton.getCenter().y - 5);
      this.bgButton.setFrame(1);
      this.background && this.background.setPosition(18, 100);
      this.charge && this.charge.setPosition(this.background.x + 5, this.background.y + 5);
      this.scene.selectedPointer = this.triggerKey;
      this.scene.deselectButtons();
      this.scene.cursor = this.cursor;
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
      if (this.area && this.area.width > this.maxValue) {
         this.area.width = this.maxValue;

         if (this.glowTween) {
            this.glowTween.resume();
         }
      }
   }

   update() {
      if (this.area) {
         this.area.width += this.incValue;
         this.charge.setCrop(this.area);
      }
   }

}
