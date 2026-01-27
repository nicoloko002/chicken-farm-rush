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
import { Button } from '../ui/Button';

export class Game extends Scene {

    constructor() {
        super('Game');
    }

    create() {
        this.chickenGroup = new ChickenGroup(this);
        this.chickenGroup.add(new Chicken(this, 500, 500));
        this.input.on('pointerdown', this.scenarioInteraction, this);

        this.configUi();
        this.configEnemies();
        this.configEffects();
    }

    configUi() {
        this.uiContainer = this.add.container(0, 0);
        
        let eggImg = this.add.sprite(40, 550, 'petEgg');
        eggImg.setScale(.35);
        eggImg.setRotation(-.6);
        this.uiContainer.add(eggImg);

        this.score = new Score(this, 80, 545);
        this.score.incScore(6);
        this.uiContainer.add(this.score);

        this.hand = new Button(this, 160, 515, 'masterHand', 'bgBtn', null, 'Q');
        this.hand.setIncValue(10);
        this.uiContainer.add(this.hand);

        this.stick = new Button(this, 240, 515, 'stick', 'bgBtn', 'chargeBarHealthFill', 'W', null, {
            atack: {
                min: 2,
                max: 5,
                animation: 'punchEffect',
                origin: {
                x: 0.5,
                y: 0.5
                }
            },
        });
        this.stick.setIncValue(5);
        this.uiContainer.add(this.stick);

        this.bulletegg = new Button(this, 320, 515, 'bulletegg', 'bgBtn', 'chargeBarHealthFill', 'E', 1, {
            atack: {
                min: 60,
                max: 60,
                animation: 'shotEffect',
                origin: {
                x: 0.5,
                y: 0.5
                }
            },
        });
        this.bulletegg.setIncValue(1);
        this.uiContainer.add(this.bulletegg);

        this.minegg = new Button(this, 400, 515, 'minegg', 'bgBtn', 'chargeBarHealthFill', 'R', 2);
        this.minegg.setIncValue(.3);
        this.uiContainer.add(this.minegg);

        this.empEggranade = new Button(this, 480, 515, 'empEggranade', 'bgBtn', 'chargeBarHealthFill', 'T', 50, {
            atack: {
                min: 9999,
                max: 9999,
                animation: 'empEffect',
                origin: {
                x: 0.5,
                y: 0.5
                },
                damageSound: this.sound.add('shock')
            },
        });
        this.empEggranade.setIncValue(.01);
        this.uiContainer.add(this.empEggranade);
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