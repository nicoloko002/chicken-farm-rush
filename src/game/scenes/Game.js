import {
    EventBus
} from '../EventBus';
import {
    Scene
} from 'phaser';
import { Score } from '../ui/Score';
import { Button } from '../ui/Button';
import { Chicken } from '../entities/npcs/pets/Chicken';
import { Snake } from '../entities/npcs/enemies/Snake';
import { EnemyGroup } from '../entities/npcs/enemies/EnemyGroup';
import { Alien } from '../entities/npcs/enemies/Alien';
import { Frog } from '../entities/npcs/enemies/Frog';

var capturatorGroup;

export class Game extends Scene {
    selectedPointer = 'Q';
    foodGroup = null;

    constructor() {
        super('Game');
    }

    create() {
        this.cursor = {};

        this.background = this.add.image(400, 300, 'background');
        this.eggSwallowSound = this.sound.add('bite');
        this.boomSound = this.sound.add('boom');

        this.fullScreen = this.add.image(750, 50, 'fullScreen')
            .setInteractive({
                useHandCursor: true
            })
            .on('pointerdown', function () {
                this.scale.toggleFullscreen();
            }, this);

        this.anims.create({
            key: 'bite',
            frames: this.anims.generateFrameNames('bite', {
                start: 1,
                end: 8,
                first: 1,
                suffix: '.png'
            }),
            frameRate: 10
        });

        this.anims.create({
            key: 'masterHand',
            frames: this.anims.generateFrameNames('masterHand', {
                start: 1,
                end: 8,
                first: 1,
                suffix: '.png'
            }),
            frameRate: 15,
        });

        this.anims.create({
            key: 'punchEffect',
            frames: this.anims.generateFrameNames('punchEffect', {
                start: 0,
                end: 7,
                first: 0
            }),
            frameRate: 20,
        });

        this.anims.create({
            key: 'shotEffect',
            frames: this.anims.generateFrameNames('shotEffect', {
                start: 0,
                end: 7,
                first: 0
            }),
            frameRate: 20,
        });

        this.anims.create({
            key: 'bombEffect',
            frames: this.anims.generateFrameNames('bombEffect', {
                start: 0,
                end: 7,
                first: 0
            }),
            frameRate: 14,
        });

        this.anims.create({
            key: 'empEffect',
            frames: this.anims.generateFrameNames('empEffect', {
                start: 0,
                end: 7,
                first: 0
            }),
            frameRate: 18,
        });

        // this.uiGroup = new Phaser.Physics.Arcade.StaticGroup(this.physics.world, this);
        this.uiGroup = this.add.group();

        let eggImg = this.add.sprite(40, 550, 'petEgg');
        eggImg.setScale(.35);
        eggImg.setRotation(-.6);
        this.uiGroup.add(eggImg);

        this.score = new Score(this, 80, 545);
        this.score.incScore(6);
        this.uiGroup.add(this.score);

        this.hand = new Button(this, 160, 515, 'masterHand', 'bgBtn', null, 'Q');
        this.hand.setIncValue(10);
        this.uiGroup.add(this.hand);

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
        this.uiGroup.add(this.stick);

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
        this.uiGroup.add(this.bulletegg);

        this.minegg = new Button(this, 400, 515, 'minegg', 'bgBtn', 'chargeBarHealthFill', 'R', 2);
        this.minegg.setIncValue(.3);
        this.uiGroup.add(this.minegg);

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
        this.uiGroup.add(this.empEggranade);

        this.eggGroup = this.physics.add.group();

        this.chickenGroup = this.physics.add.group();
        this.chickenGroup.enableBody = true;
        this.chickenGroup.add(new Chicken(this, 400, 480, this.chickenGroup, this.eggGroup));

        capturatorGroup = this.physics.add.group();
        capturatorGroup.enableBody = true;

        this.foodGroup = this.physics.add.group();
        this.foodGroup.enableBody = true;

        this.bombGroup = this.physics.add.group();
        this.explosionGroup = this.physics.add.group();
        // this.chickenGroup.add(new Chicken(this, 400, 300, this.eggGroup));
        // this.chickenGroup.add(new Chicken(this, 400, 300, this.eggGroup));

        // this.time.addEvent({
        //    delay: 10000,
        //    callback: function () {
        //       this.enemyGroup.setTimeInterval(800, 5000);
        //       this.enemyGroup2.setTimeInterval(800, 5000);
        //       console.log('wave1');
        //    },
        //    callbackScope: this
        // });


        // this.input.on('gameobjectup', function (pointer, gameObject) {
        //    if (this.power >= 10) {
        //       gameObject.doDamage();
        //       this.power -= 10;
        //    }
        // }, this);

        this.music = this.sound.add('gameMusic', {
            loop: true
        });
        this.music.play();
        this.music.volume = 0.1;

        this.damageSound = this.sound.add('damageSound');

        this.input.on('pointerdown', this.scenarioInteraction, this);
        EventBus.on('eggClicked', this.collectEgg, this);

        this.alienGenerator = new EnemyGroup(this);
        this.alienGenerator.addEnemyClass(Alien);
        this.alienGenerator.setTimeInterval(60000, 180000);
        // this.alienGenerator.setTimeInterval(100, 1000);
        this.alienGenerator.setRangeX(10, 790);
        this.alienGenerator.setRangeY(0, 0);
        this.alienGenerator.start();

        // new Frog(this, 50, 400);

        this.leftSideGenerator = new EnemyGroup(this);
        this.leftSideGenerator.addEnemyClass(Snake);
        // this.leftSideGenerator.addEnemyClass(Frog);
        // this.leftSideGenerator.setTimeInterval(1000, 5000);
        this.leftSideGenerator.setTimeInterval(15000, 30000);
        this.leftSideGenerator.setRangeX(0, 0);
        this.leftSideGenerator.setRangeY(465, 465);
        this.leftSideGenerator.start();

        this.rightSideGenerator = new EnemyGroup(this);
        this.rightSideGenerator.addEnemyClass(Snake);
        // this.rightSideGenerator.addEnemyClass(Frog);
        // this.rightSideGenerator.setTimeInterval(1000, 5000);
        this.rightSideGenerator.setTimeInterval(15000, 30000);
        this.rightSideGenerator.setRangeX(800, 800);
        this.rightSideGenerator.setRangeY(465, 465);
        this.rightSideGenerator.start();

        this.time.addEvent({
            delay: 60000,
            callback: function () {
                this.leftSideGenerator.addEnemyClass(Frog);
                this.rightSideGenerator.addEnemyClass(Frog);
                this.leftSideGenerator.setTimeInterval(13000, 28000);
                this.rightSideGenerator.setTimeInterval(13000, 28000);
            },
            callbackScope: this
        });

        this.time.addEvent({
            delay: 110000,
            callback: function () {
                this.leftSideGenerator.setTimeInterval(10000, 25000);
                this.rightSideGenerator.setTimeInterval(10000, 25000);
            },
            callbackScope: this
        });

        this.time.addEvent({
            delay: 150000,
            callback: function () {
                this.leftSideGenerator.setTimeInterval(8000, 20000);
                this.rightSideGenerator.setTimeInterval(8000, 20000);
            },
            callbackScope: this
        });

        this.time.addEvent({
            delay: 200000,
            callback: function () {
                this.leftSideGenerator.setTimeInterval(5000, 15000);
                this.rightSideGenerator.setTimeInterval(5000, 15000);
            },
            callbackScope: this
        });

        this.time.addEvent({
            delay: 300000,
            callback: function () {
                this.leftSideGenerator.setTimeInterval(3000, 12000);
                this.rightSideGenerator.setTimeInterval(3000, 12000);
            },
            callbackScope: this
        });

        this.setColliders();
        this.deselectButtons();

        this.anims.create({
            key: 'blinkMine',
            frames: this.anims.generateFrameNumbers('minegg', {
                start: 0,
                end: 2,
                first: 0
            }),
            frameRate: 10,
            repeat: -1
        });

        EventBus.on('enemy-clicked', (enemy) => (this.selectedPointer == 'W' || this.selectedPointer == 'E' || this.selectedPointer == 'T') && this.canUseItem() && enemy.doDamage());
        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('GameOver');
    }



    deselectButtons() {
        this.uiGroup.getChildren().forEach((item, i) => {
            item instanceof Button && item.deselect();
        });
    }

    canUseItem() {
        let inputCost = 0;

        switch (this.selectedPointer) {
            case 'E':
                inputCost = 1;

                if (+this.score.text >= inputCost) {
                    this.score.incScore(-inputCost);
                } else {
                    return false;
                }
                break;
            case 'R':
                inputCost = 2;

                if (+this.score.text >= inputCost) {
                    this.score.incScore(-inputCost);
                } else {
                    return false;
                }
                break;
            case 'T':
                inputCost = 50;

                if (+this.score.text >= inputCost) {
                    this.score.incScore(-inputCost);
                } else {
                    return false;
                }
                break;
            default:

        }

        return true;
    }

    scenarioInteraction(pointer) {
        this.selectedPointer == 'Q' && this.chickenGroup.getChildren().forEach(item =>
            Phaser.Math.Distance.BetweenPoints(pointer.position, item.body.position) < 120 &&
            (
                (item.jumpTweenRunning.isPlaying() && (item.jumpTweenRunning.stop(), item.initPosition.x = item.x, item.setY(item.initPosition.y))),
                (item.iddleTimer && item.iddleTimer.remove()),
                item.jump(5, pointer.position.x > item.getCenter().x ? -1 : 1, 100)
            )
        );

        this.selectedPointer == 'R' && this.canUseItem() && this.bombGroup.create(pointer.x, 475, 'minegg').setScale(.4).play('blinkMine');
    }

    update() {
        this.uiGroup.getChildren().forEach((item, i) => {
            item.update();
        });

        // if (this.chickenGroup.countActive() <= 0 && this.eggGroup.countActive() <= 0) {
        //     this.lostGame();
        // }
    }

    render() {
        //    this.game.debug.text('killSequence:' + this.grassGenerator.killSequence, 32, 100);
        //    this.game.debug.text('genSequence:' + this.grassGenerator.genSequence, 32, 120);

        //    this.game.debug.body(this.personagem);
        //    this.game.debug.body(this.personagem.actionArea);
        //    this.batGroup.forEachAlive(function(member) { this.game.debug.body(member) }, this);
        //    this.enemyGroup.forEachAlive(function(member) { this.game.debug.body(member) }, this);
        //    this.game.debug.body(this.batGroup.pivotCoord);
        //    for (var prop in this.batGroup.pivotCoord.children) {
        //        this.game.debug.body(this.batGroup.pivotCoord.children[prop]);
        //    }
        //    this.game.debug.body(this.personagem.chargeBar);
    }

    setColliders() {
        // this.physics.add.collider(this.leftSideGenerator, this.chickenGroup, this.collideWithEnemy, null, this);
        // this.physics.add.collider(this.rightSideGenerator, this.chickenGroup, this.collideWithEnemy, null, this);
        this.physics.add.overlap(capturatorGroup, this.chickenGroup, this.captureChicken, null, this);
        this.physics.add.overlap(this.leftSideGenerator, this.chickenGroup, this.collideWithChicken, null, this);
        this.physics.add.overlap(this.rightSideGenerator, this.chickenGroup, this.collideWithChicken, null, this);
        this.physics.add.overlap(this.leftSideGenerator, this.eggGroup, this.collideWithEgg, null, this);
        this.physics.add.overlap(this.rightSideGenerator, this.eggGroup, this.collideWithEgg, null, this);

        this.physics.add.overlap(this.chickenGroup, this.foodGroup, this.catchFood, null, this);
        this.physics.add.overlap(this.leftSideGenerator, this.foodGroup, this.catchFood, null, this);
        this.physics.add.overlap(this.rightSideGenerator, this.foodGroup, this.catchFood, null, this);

        this.physics.add.overlap(this.leftSideGenerator, this.bombGroup, this.explode, null, this);
        this.physics.add.overlap(this.rightSideGenerator, this.bombGroup, this.explode, null, this);

        this.physics.add.overlap(this.leftSideGenerator, this.explosionGroup, this.explosion, null, this);
        this.physics.add.overlap(this.rightSideGenerator, this.explosionGroup, this.explosion, null, this);
    }

    catchFood(person, food) {
        this.eggSwallowSound.play();
        person instanceof Chicken && person.increaseXp(5);
        food.destroy();
    }

    explode(person, bomb) {
        bomb.destroy();
        this.boomSound.play();
        let explosion = this.physics.add.sprite(bomb.x, bomb.y, 'bombEffect');
        this.explosionGroup.add(explosion);
        explosion.setScale(2, 1);
        explosion.play('bombEffect');
        explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => explosion.destroy());
    }

    explosion(person, explosion) {
        person.doDamage({
            min: 200,
            max: 200,
        });
    }

    collideWithChicken(enemy, chicken) {
        if (enemy instanceof Snake) {
            if (!chicken.jumpTweenRunning.isPlaying() || chicken.jumpTweenRunningDuration != 100)
                chicken.jump(3, enemy.x < chicken.x ? 1 : -1, 100);
        } else {
            this.eggSwallowSound.play();
            chicken.kill();
        }
    }

    collideWithEgg(enemy, egg) {
        this.eggSwallowSound.play();
        egg.kill();
    }

    stopEnemyCreators() {
        this.leftSideGenerator.timer.paused = true;
        this.rightSideGenerator.timer.paused = true;
    }

    clearGroups() {
        this.leftSideGenerator.children && this.leftSideGenerator.children.each(this.killAll);
        this.rightSideGenerator.children && this.rightSideGenerator.children.each(this.killAll);
        // this.leftSideGenerator.destroy();
        // this.rightSideGenerator.destroy();
    }

    killAll(obj) {
        obj.kill();
    }

    collideWithEnemy(pet, enemy) {
        if (pet.canEat) {
            doDamage(pet.atack, enemy);

            if (!enemy.alive)
                pet.increaseXp(enemy.xp);
        }

        if (enemy.situation == 'atacking' && enemy.atack && enemy.active) {
            doDamage(enemy.atack, pet);

            enemy.situation = 'normal';

            this.time.addEvent({
                delay: 2000,
                callback: function () {
                    if (enemy) {
                        enemy.situation = 'atacking';

                        if (enemy.body)
                            enemy.body.setVelocityX(enemy.velocityOriented);
                    }
                }
            });
        }
    }

    lostGame() {
        var style = {
            font: "30px Arial Black",
            fill: "#ff0044",
            align: "center"
        };

        this.add.text(50, 320, 'You Lose!!!', style);

        this.time.addEvent({
            delay: 3000,
            callback: function () {
                this.quitGame();
            },
            callbackScope: this
        });
    }

    quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
        this.music.stop();
        this.stopEnemyCreators();
        this.clearGroups();

        //  Then let's go back to the main menu.
        this.scene.start('MainMenu');
    }

    endGame() {
        this.endGameReached = true;
        this.music.stop();
        this.music = this.sound.add('endGameMusic');
        this.music.play();

        this.alienGenerator.stop();
        this.alienGenerator.setTimeInterval(1000, 2000);
        this.alienGenerator.start();
        this.sorry();
        this.stopEnemyCreators();
    }

    sorry() {
        var style = {
            font: "30px Arial Black",
            fill: "#ff0044",
            align: "center"
        };

        this.add.text(50, 320, 'Congratulations, you did it!', style);
        this.add.text(50, 360, 'Thank you for playing ;-)', style);
    }

    collectEgg() {
        this.score.incScore(1);
    }

    captureChicken(capturator, chicken) {
        chicken.jumpTweenRunning && chicken.jumpTweenRunning.stop();
        chicken.eggTimer && chicken.eggTimer.remove();

        this.tweens.add({
            targets: chicken,
            y: capturator.y,
            x: capturator.x,
            alpha: .2,
            angle: 360,
            ease: 'linear',
            duration: 5000,
            onComplete: () => chicken.kill()
        });
    }
}