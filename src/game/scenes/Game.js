import ChickenGroup from '../entities/ChickenGroup';
import { EnemyGroup } from '../entities/npcs/enemies/EnemyGroup';
import { Snake } from '../entities/npcs/enemies/Snake';
import { Chicken, JumpingState } from '../entities/npcs/pets/Chicken';
import {
    EventBus
} from '../EventBus';
import {
    Scene
} from 'phaser';
import { doDamage } from '../entities/npcs/enemies/Enemy';
import { Score } from '../ui/Score';
import { Tool } from '../ui/Tool';
import { ToolManager } from '../ui/ToolManager';
import { Egg } from '../entities/npcs/pets/Egg';

export class Game extends Scene {

    constructor() {
        super('Game');
    }

    create() {
        this.eggSwallowSound = this.sound.add('bite');

        this.foodGroup = this.physics.add.group();
        this.foodGroup.enableBody = true;

        this.configPet();
        this.configUi();
        this.configEnemies();
        this.configEffects();
    }

    configPet() {
        this.chickenGroup = new ChickenGroup(this);
        this.chickenGroup.add(new Chicken(this, 500, 500));

        this.eggGroup = this.physics.add.group();

        EventBus.on('chicken:layEgg', (chicken) => {
            if (chicken.instance.x > 0 && chicken.instance.x < this.cameras.main.width) {
                this.eggGroup.add(new Egg(this, chicken.instance.x, chicken.baseHeight, this.eggGroup, this.chickenGroup));
            }
        });

        EventBus.on('egg:hatched', (egg) => this.chickenGroup.add(new Chicken(this, egg.x, egg.y)))
        EventBus.on('egg:clicked', (egg) => this.score.incScore(1));
        EventBus.on('chicken:killed', (chicken) => this.chickenGroup.remove(chicken));

        this.physics.add.overlap(this.chickenGroup, this.foodGroup, this.catchFood, null, this);
    }

    configUi() {
        this.uiContainer = this.add.container(0, 0);
        
        let eggImg = this.add.sprite(40, 725, 'petEgg');
        eggImg.setScale(.35);
        eggImg.setRotation(-.6);
        this.uiContainer.add(eggImg);

        this.score = new Score(this, 80, 720);
        this.score.incScore(6);
        this.uiContainer.add(this.score);

        this.toolManager = new ToolManager(this, this.uiContainer);
    }

    configEnemies() {
        this.leftSideGenerator = new EnemyGroup(this);
        this.leftSideGenerator.addEnemyClass(Snake);
        // this.leftSideGenerator.addEnemyClass(Frog);
        // this.leftSideGenerator.setTimeInterval(1000, 5000);
        this.leftSideGenerator.setTimeInterval(1500, 30000);
        this.leftSideGenerator.setRangeX(0, 0);
        this.leftSideGenerator.setRangeY(480, 480);
        this.leftSideGenerator.start();

        this.rightSideGenerator = new EnemyGroup(this);
        this.rightSideGenerator.addEnemyClass(Snake);
        // this.rightSideGenerator.addEnemyClass(Frog);
        // this.rightSideGenerator.setTimeInterval(1000, 5000);
        this.rightSideGenerator.setTimeInterval(1500, 30000);
        this.rightSideGenerator.setRangeX(this.cameras.main.width, this.cameras.main.width);
        this.rightSideGenerator.setRangeY(480, 480);
        this.rightSideGenerator.start();

        EventBus.on('enemyKilled', (enemy) => {
            if (enemy.x > 0 && enemy.x < this.cameras.main.width && enemy.y > 0 && enemy.y < this.cameras.main.height) {
                let food = this.foodGroup.create(enemy.x, enemy.y, 'food');
                this.tweens.add({
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
        });
        
        this.physics.add.overlap(this.leftSideGenerator, this.foodGroup, this.catchFood, null, this);
        this.physics.add.overlap(this.rightSideGenerator, this.foodGroup, this.catchFood, null, this);
        this.physics.add.overlap(this.leftSideGenerator, this.chickenGroup, this.collideWithChicken, null, this);
        this.physics.add.overlap(this.rightSideGenerator, this.chickenGroup, this.collideWithChicken, null, this);
        this.physics.add.overlap(this.leftSideGenerator, this.eggGroup, this.collideWithEgg, null, this);
        this.physics.add.overlap(this.rightSideGenerator, this.eggGroup, this.collideWithEgg, null, this);
    }

    configEffects() {
        this.anims.create({
            key: 'punchEffect',
            frames: this.anims.generateFrameNames('punchEffect', { start: 0, end: 7, first: 0 }),
            frameRate: 20,
        });
    }

   catchFood(person, food) {
      this.eggSwallowSound.play();
      const personParent = person.getData('parent');
      personParent instanceof Chicken && personParent.feed();
      food.destroy();
   }

   collideWithChicken(enemy, chicken) {
       const chickenParent = chicken.getData('parent');
      if (enemy instanceof Snake) {
         if (!(chickenParent.stateMachine.currentState instanceof JumpingState))
            chickenParent.stateMachine.transition('fastJumping', chickenParent, { direction: enemy.x < chicken.x ? 1 : -1 });
      } else {
         this.eggSwallowSound.play();
         chickenParent.destroy();
      }
   }

   collideWithEgg(enemy, egg) {
      this.eggSwallowSound.play();
      egg.kill();
   }

    update() {
    }

    render() {
    }

    setColliders() {
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}