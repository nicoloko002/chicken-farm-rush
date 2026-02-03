import ChickenGroup from '../entities/ChickenGroup';
import { EnemyGroup } from '../entities/npcs/enemies/EnemyGroup';
import { Snake } from '../entities/npcs/enemies/Snake';
import { Chicken } from '../entities/npcs/pets/Chicken';
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

export class Game extends Scene {

    constructor() {
        super('Game');
    }

    create() {
        this.chickenGroup = new ChickenGroup(this);
        this.chickenGroup.add(new Chicken(this, 500, 500));

        this.configUi();
        this.configEnemies();
        this.configEffects();
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
        this.leftSideGenerator.setRangeY(465, 465);
        this.leftSideGenerator.start();

        this.rightSideGenerator = new EnemyGroup(this);
        this.rightSideGenerator.addEnemyClass(Snake);
        // this.rightSideGenerator.addEnemyClass(Frog);
        // this.rightSideGenerator.setTimeInterval(1000, 5000);
        this.rightSideGenerator.setTimeInterval(1500, 30000);
        this.rightSideGenerator.setRangeX(this.cameras.main.width, this.cameras.main.width);
        this.rightSideGenerator.setRangeY(465, 465);
        this.rightSideGenerator.start();
        
        this.foodGroup = this.physics.add.group();
        this.foodGroup.enableBody = true;

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
        })
    }

    configEffects() {
        this.anims.create({
            key: 'punchEffect',
            frames: this.anims.generateFrameNames('punchEffect', { start: 0, end: 7, first: 0 }),
            frameRate: 20,
        });
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