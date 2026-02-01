import { EventBus } from "../../../EventBus";
import { Person } from "../../Person";

export class Enemy extends Person {
   constructor(scene, x, y, sprite) {
      super(scene, x, y, sprite);

      this.setInteractive();
      this.on('pointerup', () => EventBus.emit('enemyClicked', this));
   }

   doDamage(atack) {
      doDamage(atack || this.scene.cursor.atack, this);
   }

   doWhenKilled() {
      EventBus.emit('enemyKilled', this);
   }
}

export function doDamage(atack, target) {
   if (target.state != 'untouchable') {
      if (atack.damageSound) {
         atack.damageSound.play();
      }

      if (target.damageSound) {
         target.damageSound.play();
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