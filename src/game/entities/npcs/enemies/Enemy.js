import { Person } from "../../Person";

export class Enemy extends Person {
   constructor(scene, x, y, sprite) {
      super(scene, x, y, sprite);

      this.setInteractive();
   }

   doDamage(atack) {
      doDamage(atack || this.scene.cursor.atack, this);
   }

   doWhenKilled() {
      if (this.x > 0 && this.x < 800 && this.y > 0 && this.y < 600) {
         let food = this.scene.foodGroup.create(this.x, this.y, 'food');
         this.scene.tweens.add({
            targets: food,
            scale: {
               value: .85,
               duration: 200,
               ease: 'Power2',
               yoyo: true,
               repeat: -1
            },
            y: {
               value: 470,
               duration: 500,
               ease: 'linear'
            }
         });
      }
   }
}

function doDamage(atack, target) {
   if (target.state != 'untouchable') {
      if (atack.damageSound) {
         atack.damageSound.play();
      }

      if (target.damageSound) {
         target.damageSound.play();
      }

      if (target.scene.damageSound) {
         target.scene.damageSound.play();
      }

      if (atack.animation) {
         var anim = target.scene.add.sprite(target.x, target.y, atack.animation);
         anim.play(atack.animation);

         if (atack.origin) {
            anim.setOrigin(atack.origin.x, atack.origin.y);
         }

         anim.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => anim.destroy());
      }

      if (atack.sound) {
         var sound = target.scene.sound.add(atack.sound);
         sound.once('complete', () => sound.destroy());
         sound.play();
      }

      var damage = Phaser.Math.RND.integerInRange(atack.min, atack.max);

      var style = {
         font: "25px Arial Black",
         fill: "#ff0044",
         align: "center"
      };

      var text = target.scene.add.text(target.x, target.y, damage, style);
      var tween = target.scene.tweens.add({
         targets: text,
         y: text.y - 50,
         alpha: 0,
         duration: 500,
         ease: 'linear',
         onComplete: function(tween, targets) {
            targets[0].destroy();
         }
      });

      target.damage(damage);

      if ((atack instanceof Phaser.GameObjects.GameObject) && !atack.pierce)
         atack.kill();
   }
}