import { EventBus } from "../../../EventBus";
import { State, StateMachine } from "../../StateMachine";

const CHICKEN_CONFIG = {
   EVOLVE_DELAY: 10000,
   LAY_EGG_DELAY: [8000, 10000],
   IDDLE_DELAY: [1000, 5000],
   JUMPING: {
      SLOW: { DURATION: 200, DISTANCE: 25 },
      FAST: { DURATION: 200, DISTANCE: 50 }
   }
}

class IddleState extends State {
   enter() {
      this.iddleTimer = 0;
      this.iddleTimerTarget = Phaser.Math.RND.integerInRange(CHICKEN_CONFIG.IDDLE_DELAY[0], CHICKEN_CONFIG.IDDLE_DELAY[1]);
   }

   update(entity, deltaTime) {
      this.IddleState += deltaTime;

      if (this.IddleState >= this.iddleTimerTarget) {
         entity.stateMachine.transition('slowJump');
      }
   }

   exit() {}
}

class JumpingState extends State {
   constructor(duration, distance, entity) {
      super();
      this.initPosition = new Phaser.Math.Vector2(entity.instance.x, entity.instance.y);
      this.follower = {
         t: 0,
         vec: new Phaser.Math.Vector2()
      };
      this.path = new Phaser.Curves.Path(0, 0);
      this.path.cubicBezierTo(distance, 0, distance/2, -distance, distance/2, -distance);
      this.duration = duration;

      this.bounce = () => entity.instance.scene.tweens.add(
         {
            targets: entity.instance,
            scaleY: entity.baseScale * .7,
            ease: 'Sine.easeInOut',
            duration: this.duration/2,
            yoyo: true
         }
      )
   }

   enter(entity, additionalConfig) {
      this.direction = additionalConfig.direction;
      this.initPosition.x = entity.instance.x;
      entity.instance.setFlipX(this.direction < 0 ? true : false);
      this.follower.t = 0;
      this.jumpTween = entity.instance.scene.tweens.add({
         targets: this.follower,
         t: 1,
         ease: 'Sine.easeInOut',
         duration: this.duration,
         onRepeat: () => {
            this.follower.t = 0;
            this.initPosition.x = entity.instance.x;
            this.bounce();
         },
         onStart: () => this.bounce(),
         repeat: 3,
         onComplete: () => entity.stateMachine.transition('iddle', entity)
      });
   }

   update(entity, deltaTime) {
      this.path.getPoint(this.follower.t, this.follower.vec);
      entity.instance.setPosition(this.initPosition.x + this.follower.vec.x * (entity.instance.flipX ? -1 : 1), this.initPosition.y + this.follower.vec.y);
   }

   exit(entity) {
      this.jumpTween.stop();
      this.initPosition.x = entity.instance.x;
      entity.instance.setY(this.initPosition.y);
   }
}

export class Chicken {
   constructor(scene, x, y) {
      this.instance = scene.physics.add.sprite(x, y, 'miniChicken');
      this.instance.setOrigin(.5, 1);
      this.baseScale = .5;
      this.instance.setScale(this.baseScale);
      this.stateMachine = new StateMachine()
         .addState('iddle', new IddleState())
         .addState('slowJumping', new JumpingState(CHICKEN_CONFIG.JUMPING.SLOW.DURATION, CHICKEN_CONFIG.JUMPING.SLOW.DISTANCE, this))
         .addState('fastJumping', new JumpingState(CHICKEN_CONFIG.JUMPING.FAST.DURATION, CHICKEN_CONFIG.JUMPING.FAST.DISTANCE, this))

      this.active = true;
      scene.entities.add(this);
      this.level = 0;
      this.targetLevelToLayEggs = 3
      this.baseHeight = this.instance.y;

      this.evolveTimer = scene.time.addEvent({
         delay: CHICKEN_CONFIG.EVOLVE_DELAY,
         callback: () => {
            if (this.level >= this.targetLevelToLayEggs)
               return;

            this.evolve();

            if (this.level >= this.targetLevelToLayEggs && !this.eggTimer) {
               this.eggTimer = scene.time.addEvent({
                  delay: Phaser.Math.RND.integerInRange(CHICKEN_CONFIG.LAY_EGG_DELAY[0], CHICKEN_CONFIG.LAY_EGG_DELAY[1]),
                  callback: this.layEgg,
                  callbackScope: this,
                  loop: true
               });
            }
         },
         repeat: this.targetLevelToLayEggs-1
      });
   }

   feed() {
      if (this.level >= this.targetLevelToLayEggs)
         this.evolve()
      else
         this.layEgg()
   }

   evolve() {
      this.instance.setScale(this.instance.scaleX + .05);
      this.level += 1;
   }

   layEgg() {
      EventBus.emit('chicken:layEgg', this);
   }

   pointerInteraction(pointer) {
      if (this.stateMachine.currentState instanceof JumpingState) 
         this.stateMachine.transition('iddle', this);
      else
         this.stateMachine.transition('fastJumping', this, { direction: pointer.position.x > this.instance.getCenter().x ? -1 : 1 });
   }

   stopJump()
   {
   }

   jump(direction, duration) {
   }

   setActive(value) {
      this.active = value;
      return this;
   }

   update(delta){
      this.stateMachine.update(this, delta);
   }
}
