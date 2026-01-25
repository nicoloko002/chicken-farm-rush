export class Chicken {
   instance;
   jumpTween;
   path;

   constructor(scene, x, y) {
      this.instance = scene.physics.add.sprite(x, y, 'miniChicken');
      this.instance.setOrigin(.5, 1);
      this.initPosition = new Phaser.Math.Vector2(x, y);
      this.baseScale = .5;
      this.instance.setScale(this.baseScale);
      
      this.follower = {
         t: 0,
         vec: new Phaser.Math.Vector2()
      };
      this.path = new Phaser.Curves.Path(0, 0);
      this.path.cubicBezierTo(50, 0, 25, -50, 25, -50);

      this.active = true;
      scene.entities.add(this);
   }

   pointerInteraction(pointer) {
      if (this.jumpTween?.isPlaying()) 
         this.stopJump();
      else
         this.jump(pointer.position.x > this.instance.getCenter().x ? -1 : 1, 200);
   }

   stopJump()
   {
      this.jumpTween.stop();
      this.initPosition.x = this.instance.x;
      this.instance.setY(this.initPosition.y);
      this.follower.t = 0;
   }

   jump(direction, duration) {
      this.initPosition.x = this.instance.x;
      this.instance.setFlipX(direction < 0 ? true : false);
      this.follower.t = 0;
      const bounce = () => this.instance.scene.tweens.add(
         {
            targets: this.instance,
            scaleY: this.baseScale * .7,
            ease: 'Sine.easeInOut',
            duration: duration/2,
            yoyo: true
         }
      )
      this.jumpTween = this.instance.scene.tweens.add({
         targets: this.follower,
         t: 1,
         ease: 'Sine.easeInOut',
         duration: duration,
         onRepeat: () => {
            this.follower.t = 0;
            this.initPosition.x = this.instance.x;
            bounce();
         },
         onStart: () => bounce(),
         repeat: 3
      });
   }

   setActive(value) {
      this.active = value;
      return this;
   }

   update(delta){
      this.path.getPoint(this.follower.t, this.follower.vec);
      this.instance.setPosition(this.initPosition.x + this.follower.vec.x * (this.instance.flipX ? -1 : 1), this.initPosition.y + this.follower.vec.y);
   }

   destroy() {
      this.scene.entities.remove(this);
   }

}
