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

export class Game extends Scene {

    constructor() {
        super('Game');
    }

    create() {
        this.chickenGroup = new ChickenGroup(this);
        this.chickenGroup.add(new Chicken(this, 500, 500));
        this.input.on('pointerdown', this.scenarioInteraction, this);

        this.configEnemies();
        this.configEffects();
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

        EventBus.on('enemyKilled', (enemy) => {
            if (enemy.x > 0 && enemy.x < this.scene.cameras.main.width && enemy.y > 0 && enemy.y < this.scene.cameras.main.height) {
                let food = this.foodGroup.create(this.x, this.y, 'food');
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
        })

        EventBus.on('enemyClicked', (enemy) => enemy.doDamage({
            min: 2,
            max: 5,
            animation: 'punchEffect',
            origin: {
               x: 0.5,
               y: 0.5
            },
            damageSound: this.sound.add('damageSound')
        }));
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

    scenarioInteraction(pointer) {
        this.chickenGroup.pointerInteraction(pointer);
    }
}