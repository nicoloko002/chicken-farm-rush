import Phaser from "phaser";
import { EventBus } from "../EventBus";

const TAKING_DAMAGE = 'taking_damage';
const NORMAL = 'normal';

export class Entity extends Phaser.GameObjects.Sprite { // Herda item, NPC, staticObjects

   constructor(scene, x, y, sprite) {
      super(scene, x, y, sprite);

      this.DEAD = 'dead';

      this.state = 'nothing';
      this.situation = NORMAL;

      this.exists = true;
      this.visible = true;
      this.alive = true;

      this.UP = 'up';
      this.DOWN = 'down';
      this.LEFT = 'left';
      this.RIGHT = 'right';
      this.IDLE = 'idle';

      // this.velocityNormalized = new Phaser.Geom.Point(0, 0);

      // this.alwaysMoving = false; //!! talvez dava pra separar essas coisas que são de caminho em outra classe
      // this.movePath = [];
      // this.currentPathPosition = 0;

      // this.moveVelocity = 0; //!! da pra melhorar, talvez usando o negócio do timer por evento, tem que dar uma procurada se tem jeito melhor
      // this.timeToNextMove = 0;
      // this.timeSinceLastMove = 0;

      // this.asyncPath = null;

      // this.healthBar; //!! arrumar

      EventBus.on('killed', this.whenKilled, this);

      this.killWhenOutOfBounds = false;
      this.alreadyShowed = false;
      this.scene.add.existing(this);

      this.tweenDano = null;
   }

   playTweenDano() {
      if (!this.tweenDano) {
         this.tweenDano = this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 100,
            ease: 'linear',
            paused: true,
            yoyo: true
         });
      }

      this.tweenDano.play();
   }

   setTileMap(tileMap) {
      if (this.asyncPath == null)
         this.asyncPath = this.game.plugins.add(Phaser.Plugin.asyncPath);

      this.asyncPath.tileMap = tileMap;
   }

   setWalkableTileLayer(tileLayer) {
      this.floor = tileLayer;
   }

   setNonWalkableTiles(nonWalkableTiles) {
      this.asyncPath.nonWalkableTile = nonWalkableTiles;
   }

   addIdleAnimation(framePositions, speed) {
      this.animations.add(this.IDLE, framePositions, speed, true);
   }

   addMovingUpAnimation(framePositions, speed) {
      this.animations.add(this.UP, framePositions, speed, true);
   }

   addMovingDownAnimation(framePositions, speed) {
      this.animations.add(this.DOWN, framePositions, speed, true);
   }

   addMovingLeftAnimation(first, end, speed) {
      var config = {
         key: this.texture.key + '_' + this.LEFT,
         frames: this.scene.anims.generateFrameNumbers(this.texture.key, { start: first, end: end, first: first }),
         frameRate: speed,
         repeat: -1
      };

      this.scene.anims.create(config);
   }

   addMovingRightAnimation(first, end, speed) {
      var config = {
         key: this.texture.key + '_' + this.RIGHT,
         frames: this.scene.anims.generateFrameNumbers(this.texture.key, { start: first, end: end, first: first }),
         frameRate: speed,
         repeat: -1
      };

      this.scene.anims.create(config);
   }

   // moveEntity() {
   //    this.body.velocity.x = this.velocityNormalized.x * this.moveVelocity;
   //    this.body.velocity.y = this.velocityNormalized.y * this.moveVelocity;
   //
   //    if (this.body.velocity.x > this.body.velocity.y) {
   //       if ((this.body.velocity.y < -0.1) && (this.animations.getAnimation(this.UP) != null)) {
   //          if (this.facing != this.UP) {
   //             this.animations.play(this.UP);
   //          }
   //       } else if ((this.body.velocity.x > 0.1) && (this.animations.getAnimation(this.RIGHT) != null)) {
   //          if (this.facing != this.RIGHT) {
   //             this.animations.play(this.RIGHT);
   //          }
   //       }
   //    } else if (this.body.velocity.x < this.body.velocity.y) {
   //       if ((this.body.velocity.y > 0.1) && (this.animations.getAnimation(this.DOWN) != null)) {
   //          if (this.facing != this.DOWN) {
   //             this.animations.play(this.DOWN);
   //          }
   //       } else if ((this.body.velocity.x < -0.1) && (this.animations.getAnimation(this.LEFT) != null)) {
   //          if (this.facing != this.LEFT) {
   //             this.animations.play(this.LEFT);
   //          }
   //       }
   //    } else if (this.body.velocity.x == this.body.velocity.y) {
   //       if (this.body.velocity.x == 0) {
   //          if (this.facing != this.IDLE) {
   //             if ((this.animations.getAnimation(this.IDLE) != null)) {
   //                this.animations.play(this.IDLE);
   //             } else if (this.alwaysMoving == false) {
   //                this.animations.stop();
   //             }
   //
   //             this.facing = this.IDLE;
   //          }
   //       } else if ((this.body.velocity.x < 0) && (this.animations.getAnimation(this.LEFT) != null)) {
   //          if (this.facing != this.LEFT) {
   //             this.animations.play(this.LEFT);
   //          }
   //       } else if ((this.body.velocity.x > 0) && (this.animations.getAnimation(this.RIGHT) != null)) {
   //          if (this.facing != this.RIGHT) {
   //             this.animations.play(this.RIGHT);
   //          }
   //       }
   //    }
   // }

   // reachedTile(tilePos) {
   //    var distance;
   //
   //    distance = Phaser.Point.distance(this.position, new Phaser.Point(tilePos.worldX + Constants.TILE_HALF, tilePos.worldY + Constants.TILE_HALF));
   //    return distance < 5;
   // }

   behaviorPattern() {}

   preUpdate(time, delta) {
      super.preUpdate(time, delta);

      if (this.alive && (this.state != this.DEAD)) {
         if (!this.alreadyShowed && this.killWhenOutOfBounds && this.inWorld) {
            this.alreadyShowed = true;
            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;
         }

         this.behaviorPattern();

         // if (this.movePath.length > 0) {
         //    var tilePos;
         //
         //    if (this.floor != null) {
         //       tilePos = this.floor.map.getTile(this.movePath[this.currentPathPosition].X, this.movePath[this.currentPathPosition].Y);
         //    } else {
         //       tilePos = {
         //          worldX: this.movePath[this.currentPathPosition].X,
         //          worldY: this.movePath[this.currentPathPosition].Y
         //       };
         //    }
         //
         //    if (!this.reachedTile(tilePos)) {
         //       this.velocityNormalized.set(tilePos.worldX + Constants.TILE_HALF - this.position.x, tilePos.worldY + Constants.TILE_HALF - this.position.y);
         //
         //       this.velocityNormalized.normalize();
         //
         //       this.body.velocity.x = this.velocityNormalized.x * this.moveVelocity;
         //       this.body.velocity.y = this.velocityNormalized.y * this.moveVelocity;
         //    } else {
         //       if (this.currentPathPosition < this.movePath.length - 1) {
         //          this.currentPathPosition += 1;
         //          this.update();
         //       } else {
         //          this.movePath = [];
         //          this.currentPathPosition = -1;
         //          this.velocityNormalized.set(0, 0);
         //          this.timeSinceLastMove = this.game.time.time;
         //       }
         //    }
         //
         //    if (this.body != null)
         //       this.moveEntity();
         // }

         var topLeft = this.getTopLeft();
         var bottomRight = this.getBottomRight();

         if (bottomRight.x < 0 || bottomRight.y < 0 || topLeft.x > 800 || topLeft.y > 600) {
            this.kill();
         }
      }
   }

   // moveToPoint(destinationPoint) {
   //    var tile = this.map.getTileWorldXY(destinationPoint.x, destinationPoint.y, Constants.TILE_SIZE, Constants.TILE_SIZE, this.floor);
   //
   //    if ((tile != null) && (this.map.collideIndexes.indexOf(tile.index) == -1)) {
   //       var ent = this;
   //       if ((Math.abs(tile.x - this.body.center.x) > Constants.TILE_SIZE) ||
   //          (Math.abs(tile.y - this.body.center.y) > Constants.TILE_SIZE)) {
   //          var block = {
   //             Origin: ent.body.center,
   //             Destination: destinationPoint,
   //             Diagonals: false,
   //             debugpath: false,
   //             found: function(path) {
   //                ent.currentPathPosition = 1;
   //                ent.movePath = path;
   //             },
   //             notfound: function() {
   //                console.log('No path found');
   //             }
   //          };
   //
   //          this.asyncPath.getPath(block);
   //       }
   //    }
   // }

   whenKilled() {
      this.state = this.DEAD;
      this.doWhenKilled();
   }

   /* Implement */
   doWhenKilled() {}

   damage(amount) {
      if (this.alive) {
         this.health -= amount;

         if (this.health <= 0) {
            this.murdered();
            this.kill();
         } else {
            this.playTweenDano();
         }
      }

      return this;
   }

   kill() {
      this.alive = false;
      this.setActive(false);
      this.setVisible(false);

      EventBus.emit('killed');

      this.x = 0;
      this.y = 0;

      this.destroy();
   }

   murdered(){}
}

class GeradorEntidade {

   constructor(state) {
      this.state = state;
   }

   criarEntidade() {
      var entidade = this.entidadeCriada();

      return entidade;
   }

   entidadeCriada() {
      // sobrescrever sempre
      return null;
   }
}
