import { Entity } from './Entity' 

export class Person extends Entity {

   constructor(scene, x, y, sprite) {
      super(scene, x, y, sprite);

      this.DEAD = 'dead';
      this.COMING = 'coming';
      this.CHOOSING_TARGET = 'choosing_target';
      this.ATACKING = 'atacking';
      this.PREPARING_ATACK = 'preparing_atack';
      this.MOVING = 'moving';
      this.IDLE = 'idle';
      this.ESPECIAL_ATACK = 'especial_atack';

      this.bulletGroup = null;
      this.nextAtack = scene.time.time;
      this.atackDelay = 0;
      this.target = null;
      this.atackDamage = null;

      this.weapon = null;
      this.armor = null;
      this.helmet = null;
      this.leg = null;
      this.foot = null;
   }

   preUpdate(time, delta) {
      super.preUpdate(time, delta);

      if (this.weapon != null)
         this.weapon.update();
   }

   doWhenKilled() {
      // if (this.onKilledAnimation != null) {
      //    this.animations.play(this.onKilledAnimation);
      //    this.events.onAnimationComplete.addOnce(this.limpar(), this);
      // } else {
      //    this.limpar();
      // }
   }

   setBulletSettings(bulletGroup, bulletSprite) {
      this.bulletGroup = bulletGroup;
      this.bulletGroup.enableBody = true;

      this.bulletSprite = bulletSprite;
   }

   fireBullet(pointer, charge) {
      if (this.scene.time.time > this.nextAtack) {
         if (this.weapon != null) {
            this.weapon.atack(pointer, charge);
         } else {
            var bullet = this.bulletGroup.create(this.body.center.x, this.body.center.y, this.bulletSprite);
            var bulletSpeed;

            if (charge == null)
               bulletSpeed = this.atackSpeed;
            else
               bulletSpeed = this.atackSpeed * charge / 100;

            bullet.lifespan = 1000;
            bullet.anchor.set(0.5);

            this.scene.physics.arcade.moveToObject(bullet, pointer, bulletSpeed);
         }

         this.nextAtack = this.game.time.time + this.atackDelay;
         this.aditionalAtackActions();
      }
   }

   aditionalAtackActions() {}

   setTarget(target) {
      this.target = target;
   }

   increaseXp(amount = 0) {}
}
