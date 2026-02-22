import {
    Scene
} from 'phaser';
import {
    EventBus
} from '../EventBus';
import {
    Chicken
} from '../entities/npcs/pets/Chicken';
import ChickenGroup from '../entities/ChickenGroup';
import {
    Egg
} from '../entities/npcs/pets/Egg';
import {
    Score
} from '../ui/Score';
import {
    ToolManager
} from '../ui/ToolManager';
import {
    Snake
} from '../entities/npcs/enemies/Snake';
import {
    EnemyGroup
} from '../entities/npcs/enemies/EnemyGroup';

const DEPTH_LAYERS = {
    BACKGROUND: 0,
    GROUND: 10,
    PLAYER: 20,
    ENEMIES: 15,
    UI: 100,
    TUTORIAL_OVERLAY: 200
};

const TUTORIAL_STEPS = {
    WELCOME: 'welcome',
    HAND_TOOL: 'hand_tool',
    CHICKEN_MOVEMENT: 'chicken_movement',
    MOVEMENT_SUCCESS: 'movement_success',
    MOVEMENT_STOP: 'movement_stop',
    MOVEMENT_STOP_SUCCESS: 'movement_stop_success',
    STICK_TOOL: 'stick_tool',
    ENEMY_DAMAGE: 'enemy_damage',
    ENEMY_DEFEAT: 'enemy_defeat',
    FEED_CHICKEN: 'feed_chicken',
    EGG_COLLECTION: 'egg_collection',
    EGG_HATCHING: 'egg_hatching',
    EGG_HATCHING_WAIT: 'egg_hatching_wait',
    NEWBORN_APPEARS: 'newborn_appears',
    COMPLETE: 'complete'
};

export class Tutorial extends Scene {
    constructor() {
        super('Tutorial');
    }

    create() {
        this.setupBackground();
        this.setupUI();
        this.setupChickens();
        this.setupEggs();
        this.setupEnemies();
        this.initializeTutorial();
        this.configEffects();
    }

    configEffects() {
        this.anims.create({
            key: 'punchEffect',
            frames: this.anims.generateFrameNames('punchEffect', { start: 0, end: 7, first: 0 }),
            frameRate: 20,
        });
    }

    setupBackground() {
        const background = this.add.image(0, 0, 'bg6');
        background.setOrigin(0, 0);
        background.setDisplaySize(
            this.cameras.main.width,
            this.cameras.main.height - 85
        );
        background.setTint(0xcccccc);

        const panel = this.add.image(
            -this.cameras.main.width * 0.032,
            background.displayHeight * 0.94,
            'panel'
        );
        panel.setOrigin(0, 0);
        panel.setDisplaySize(
            this.cameras.main.width * 1.068,
            this.cameras.main.height * 1.075 - background.displayHeight
        );
    }

    setupUI() {
        this.uiContainer = this.add.container(0, 0);

        const eggImg = this.add.sprite(85, 710, 'petEgg');
        eggImg.setScale(0.35);
        eggImg.setRotation(-0.6);
        this.uiContainer.add(eggImg);

        this.score = new Score(this, 125, 705);
        this.score.incScore(0);
        this.uiContainer.add(this.score);

        const chickenImg = this.add.sprite(
            this.cameras.main.width - 140,
            710,
            'miniChicken'
        );
        chickenImg.setScale(0.35);
        this.uiContainer.add(chickenImg);

        this.chickenCounter = new Score(this, this.cameras.main.width - 110, 705);
        this.chickenCounter.incScore(1);
        this.uiContainer.add(this.chickenCounter);

        this.toolManager = new ToolManager(this, this.uiContainer);
    }

    setupChickens() {
        this.chickenGroup = new ChickenGroup(this);
        this.chickenGroup.add(new Chicken(this, 500, 620));
        this.chickenGroup.setDepth(DEPTH_LAYERS.PLAYER);

        this.eggGroup = this.physics.add.group();
        this.foodGroup = this.physics.add.group();

        EventBus.on('egg:hatched', (egg) => {
            this.chickenGroup.add(new Chicken(this, egg.x, egg.y));
            this.chickenCounter.incScore(1);
            this.onChickenHatched();
        });

        EventBus.on('egg:clicked', (egg) => {
            if (this.currentStep === TUTORIAL_STEPS.EGG_HATCHING_WAIT && egg === this.demoHatchingEgg) {
                this.showEggHatchingMistakeDialog();
                return;
            }

            this.score.incScore(1);
            this.onEggCollected();
        });

        this.physics.add.overlap(
            this.chickenGroup,
            this.foodGroup,
            this.catchFood,
            null,
            this
        );
    }

    setupEggs() {
        this.eggSwallowSound = this.sound.add('bite');
    }

    setupEnemies() {
        this.enemyGroup = new EnemyGroup(this);
        this.enemyGroup.setDepth(DEPTH_LAYERS.ENEMIES);
        this.enemyGroup.addEnemyClass(Snake);

        this.demoEnemy = null;
        this.enemyDefeated = false;

        EventBus.on('enemyKilled', (enemy) => {
            if (enemy === this.demoEnemy) {
                this.enemyDefeated = true;
                this.onEnemyDefeated();
            }

            if (
                enemy.x > 0 &&
                enemy.x < this.cameras.main.width &&
                enemy.y > 0 &&
                enemy.y < this.cameras.main.height
            ) {
                let food = this.foodGroup.create(enemy.x, enemy.y, 'food');
                this.tweens.add({
                    targets: food,
                    scale: {
                        value: 0.85,
                        duration: 200,
                        ease: 'Power2',
                        yoyo: true,
                        repeat: -1
                    },
                    y: {
                        value: 600,
                        duration: 500,
                        ease: 'linear'
                    }
                });
            }
        });

        this.physics.add.overlap(
            this.enemyGroup,
            this.foodGroup,
            this.catchFood,
            null,
            this
        );
    }

    initializeTutorial() {
        this.currentStep = TUTORIAL_STEPS.WELCOME;
        this.tutorialOverlay = this.add.container(0, 0);
        this.tutorialOverlay.setDepth(DEPTH_LAYERS.TUTORIAL_OVERLAY);

        this.arrowTargets = [];
        this.arrows = [];
        this.isGamePaused = false;
        this.demoHatchingEgg = null;

        this.scene.launch('TutorialUI');

        EventBus.on('buttonPressed', (button) => {
            this.onToolSelected(button);
        });

        EventBus.on('chicken:fastJumpingStarted', () => {
            this.time.delayedCall(800, () => {
                this.onChickenMoved();
            });
        });

        EventBus.on('chicken:movementStopped', () => {
            this.onChickenMovementStopped();
        });

        this.time.delayedCall(50, () => {
            this.uiScene = this.scene.get('TutorialUI');
            this.showWelcomeStep();
        });
    }

    // ==================== TUTORIAL STEPS ====================

    showWelcomeStep() {
        this.clearTutorialOverlay();
        this.pauseGame();

        this.createDialogBox(
            'Welcome to Chicken Farm!',
            'Learn the basics:\n1. Move your chicken\n2. Defeat enemies\n3. Feed and grow your chicken\n4. Collect eggs and hatch new chickens',
            [{
                text: 'Next',
                callback: () => {
                    this.resumeGame();
                    this.showHandToolStep();
                }
            }]
        );

        this.currentStep = TUTORIAL_STEPS.WELCOME;
    }

    showHandToolStep() {
        this.clearTutorialOverlay();

        const toolPos = this.toolManager.getToolPosition('hand');
        console.log('Tool position:', toolPos);

        if (toolPos) {
            this.arrowTargets = [{
                x: toolPos.x,
                y: toolPos.y,
                id: 'hand-tool'
            }];
            console.log('Arrow targets set:', this.arrowTargets);
            this.createArrows();
        }

        this.createDialogBox(
            'Select the Hand Tool',
            'Click the hand tool to interact with your chicken.\nYou\'ll need it to move and collect eggs!',
            null,
            '👉 Click the hand tool (Q key)'
        );

        this.currentStep = TUTORIAL_STEPS.HAND_TOOL;
    }

    showChickenMovementStep() {
        this.clearTutorialOverlay();

        const chicken = this.chickenGroup.getChildren()[0];
        if (chicken) {
            this.arrowTargets = [{
                x: chicken.x,
                y: chicken.y,
                id: 'chicken'
            }];
            console.log('Arrow targets set:', this.arrowTargets);
            this.createArrows();
        }

        this.createDialogBox(
            'Move Your Chicken',
            'Click near your chicken to make it jump!\nClick on the opposite side to move that direction.',
            null,
            '👉 Try moving your chicken left or right!'
        );

        this.currentStep = TUTORIAL_STEPS.CHICKEN_MOVEMENT;
    }

    showMovementSuccessStep() {
        this.clearTutorialOverlay();
        this.removeAllArrows();
        this.pauseGame();

        this.createDialogBox(
            'Great! 🎉',
            'Your chicken can move!\nNow let\'s learn how to stop it mid-movement.',
            [{
                text: 'Continue',
                callback: () => {
                    this.resumeGame();
                    this.showMovementStopStep();
                }
            }]
        );

        this.currentStep = TUTORIAL_STEPS.MOVEMENT_SUCCESS;
    }

    showMovementStopStep() {
        this.clearTutorialOverlay();

        const chicken = this.chickenGroup.getChildren()[0];
        if (chicken) {
            this.arrowTargets = [{
                x: chicken.x,
                y: chicken.y,
                id: 'chicken'
            }];
            console.log('Arrow targets set:', this.arrowTargets);
            this.createArrows();
        }

        this.createDialogBox(
            'Stop Movement',
            'If your chicken is already moving,\nclick on it with the hand tool to stop it!\n\nThis is useful to avoid dangers.',
            null,
            '👉 Make your chicken move, then click to stop it!'
        );

        this.currentStep = TUTORIAL_STEPS.MOVEMENT_STOP;
    }

    showMovementStopSuccessStep() {
        this.clearTutorialOverlay();
        this.removeAllArrows();
        this.pauseGame();

        this.createDialogBox(
            'Perfect! 🎉',
            'You can now control your chicken\nmovement completely!',
            [{
                text: 'Continue',
                callback: () => {
                    this.resumeGame();
                    this.showStickToolStep();
                }
            }]
        );

        this.currentStep = TUTORIAL_STEPS.MOVEMENT_STOP_SUCCESS;
    }

    showStickToolStep() {
        this.clearTutorialOverlay();

        const toolPos = this.toolManager.getToolPosition('stick');
        if (toolPos) {
            this.arrowTargets = [{
                x: toolPos.x,
                y: toolPos.y,
                id: 'stick-tool'
            }];
            console.log('Arrow targets set:', this.arrowTargets);
            this.createArrows();
        }

        this.createDialogBox(
            'Select the Stick Tool',
            'The stick tool is used to attack enemies.\nIt has a charge time before it can be used.',
            null,
            '👉 Click the stick tool (W key)'
        );

        this.currentStep = TUTORIAL_STEPS.STICK_TOOL;
    }

    showEnemyDamageStep() {
        this.clearTutorialOverlay();

        this.demoEnemy = new Snake(this, 700, 500);
        this.demoEnemy.setDepth(DEPTH_LAYERS.ENEMIES);

        this.arrowTargets = [{
            x: this.demoEnemy.x,
            y: this.demoEnemy.y,
            id: 'enemy'
        }];
        console.log('Arrow targets set:', this.arrowTargets);
        this.createArrows();

        this.createDialogBox(
            'Attack the Enemy',
            'With the stick tool selected,\nclick on the enemy to attack it!\n\nWait for the charge bar to fill first.',
            null,
            '👉 Click the enemy to attack!'
        );

        this.currentStep = TUTORIAL_STEPS.ENEMY_DAMAGE;
    }

    showEnemyDefeatStep() {
        this.clearTutorialOverlay();
        this.removeAllArrows();
        this.pauseGame();

        this.createDialogBox(
            'Excellent! 🎉',
            'You defeated the enemy!\nIt dropped food that your chicken can eat.',
            [{
                text: 'Continue',
                callback: () => {
                    this.resumeGame();
                    this.showFeedChickenStep();
                }
            }]
        );

        this.currentStep = TUTORIAL_STEPS.ENEMY_DEFEAT;
    }

    showFeedChickenStep() {
        this.clearTutorialOverlay();

        const chicken = this.chickenGroup.getChildren()[0];
        const food = this.foodGroup.getChildren()[0];

        this.arrowTargets = [];

        if (chicken) {
            this.arrowTargets.push({
                x: chicken.x,
                y: chicken.y,
                id: 'chicken'
            });
        }

        if (food) {
            this.arrowTargets.push({
                x: food.x,
                y: food.y,
                id: 'food'
            });
        }

        console.log('Arrow targets set:', this.arrowTargets);
        this.createArrows();

        this.createDialogBox(
            'Feed Your Chicken',
            'Switch back to the hand tool and move\nyour chicken to the food to feed it!\n\nFeeding helps your chicken grow.',
            null,
            '👉 Move your chicken to the food!'
        );

        this.currentStep = TUTORIAL_STEPS.FEED_CHICKEN;
    }

    onChickenFed() {
        if (this.currentStep !== TUTORIAL_STEPS.FEED_CHICKEN) return;

        this.clearTutorialOverlay();
        this.removeAllArrows();
        this.showEggCollectionStep();
    }

    showEggCollectionStep() {
        const chicken = this.chickenGroup.getChildren()[0];
        const demoEgg = new Egg(
            this,
            chicken.x + 80,
            chicken.y - 100,
            this.eggGroup,
            this.chickenGroup
        );
        this.eggGroup.add(demoEgg);

        this.arrowTargets = [{
            x: demoEgg.x,
            y: demoEgg.y,
            id: 'egg'
        }];
        console.log('Arrow targets set:', this.arrowTargets);
        this.createArrows();

        this.createDialogBox(
            'Collect Eggs',
            'When your chicken lays an egg,\nclick it with the hand tool to collect it!\n\nEggs = Resources for upgrades',
            null,
            '👉 Click the egg to collect it!'
        );

        this.currentStep = TUTORIAL_STEPS.EGG_COLLECTION;
    }

    onEggCollected() {
        if (this.currentStep !== TUTORIAL_STEPS.EGG_COLLECTION) return;

        this.clearTutorialOverlay();
        this.removeAllArrows();
        this.showEggHatchingStep();
    }

    showEggHatchingStep() {
        this.clearTutorialOverlay();
        this.pauseGame();

        this.createDialogBox(
            'Eggs Hatch Into Chickens',
            'Not all eggs need to be collected!\n\nIf you leave an egg unprotected,\nit will hatch into a newborn chicken.',
            [{
                text: 'Continue',
                callback: () => {
                    this.resumeGame();
                    this.showEggHatchingWaitStep();
                }
            }]
        );

        this.currentStep = TUTORIAL_STEPS.EGG_HATCHING;
    }

    showEggHatchingWaitStep() {
        this.clearTutorialOverlay();

        const chicken = this.chickenGroup.getChildren()[0];
        this.demoHatchingEgg = new Egg(
            this,
            chicken.x + 100,
            chicken.y - 100,
            this.eggGroup,
            this.chickenGroup
        );
        
        this.time.delayedCall(1800, () => {
            this.demoHatchingEgg.changeState(this.demoHatchingEgg.MOVING_2);
        });
        this.time.delayedCall(2500, () => {
            this.demoHatchingEgg.changeState(this.demoHatchingEgg.MOVING_3);
        });
        this.time.delayedCall(3500, () => {
            this.demoHatchingEgg.changeState(this.demoHatchingEgg.CRACKING);
        });
        this.eggGroup.add(this.demoHatchingEgg);

        this.arrowTargets = [{
            x: this.demoHatchingEgg.x,
            y: this.demoHatchingEgg.y,
            id: 'hatching-egg'
        }];
        console.log('Arrow targets set:', this.arrowTargets);
        this.createArrows();

        this.createDialogBox(
            'Wait for Hatching',
            'This egg will hatch into a new chicken.\n\nProtect it from enemies and watch it grow!',
            null,
            '👉 Wait for the egg to hatch...'
        );

        this.currentStep = TUTORIAL_STEPS.EGG_HATCHING_WAIT;
    }

    showEggHatchingMistakeDialog() {
        this.clearTutorialOverlay();
        this.pauseGame();

        // Spawn a new egg for hatching
        const chicken = this.chickenGroup.getChildren()[0];
        this.demoHatchingEgg = new Egg(
            this,
            chicken.x + 100,
            chicken.y - 100,
            this.eggGroup,
            this.chickenGroup
        );
        this.eggGroup.add(this.demoHatchingEgg);

        this.arrowTargets = [{
            x: this.demoHatchingEgg.x,
            y: this.demoHatchingEgg.y,
            id: 'hatching-egg'
        }];
        this.createArrows();

        this.createDialogBox(
            'Oops! 🙈',
            'You collected the egg by mistake!\n\nThis egg was supposed to hatch into a new chicken.\n\nLet this new egg hatch instead!',
            [{
                text: 'Try Again',
                callback: () => {
                    this.resumeGame();
                }
            }]
        );
    }

    onChickenHatched() {
        if (this.currentStep === TUTORIAL_STEPS.EGG_HATCHING_WAIT) {
            this.clearTutorialOverlay();
            this.removeAllArrows();
            this.showNewbornAppearsStep();
        }
    }

    showNewbornAppearsStep() {
        const newChicken = this.chickenGroup.getChildren()[this.chickenGroup.getLength() - 1];
        if (newChicken) {
            this.arrowTargets = [{
                x: newChicken.x,
                y: newChicken.y,
                id: 'newborn'
            }];
            console.log('Arrow targets set:', this.arrowTargets);
            this.createArrows();
        }

        this.pauseGame();

        this.createDialogBox(
            'A New Chicken! 🐣',
            'Congratulations! A new chicken has hatched!\n\nYour farm is growing.\n\nWith more chickens, you\'ll get more eggs\nand resources to expand your farm!',
            [{
                text: 'Start Playing',
                callback: () => {
                    this.resumeGame();
                    this.completeTutorial();
                }
            }]
        );

        this.currentStep = TUTORIAL_STEPS.NEWBORN_APPEARS;
    }

    completeTutorial() {
        this.scene.stop('TutorialUI');
        this.scene.stop('Tutorial');

        EventBus.removeAllListeners();

        this.scene.start('Game');
    }

    // ==================== HELPER METHODS ====================

    pauseGame() {
        this.isGamePaused = true;
        this.scene.pause();
    }

    resumeGame() {
        this.isGamePaused = false;
        this.scene.resume();
    }

    createDialogBox(title, description, buttons = null, instruction = null) {
        this.uiScene.createDialogBox(title, description, buttons, instruction);
    }

    removeAllArrows() {
        console.log('Removing arrows, count:', this.arrows.length);
        this.arrows.forEach(arrow => {
            if (arrow.container) {
                arrow.container.destroy();
            }
        });
        this.arrows = [];
    }

    createArrows() {
        this.arrows.forEach(arrow => {
            if (arrow.container) {
                arrow.container.destroy();
            }
        });
        this.arrows = [];

        console.log('Creating arrows for targets:', this.arrowTargets);

        this.arrowTargets.forEach(target => {
            console.log('Creating arrow at:', target.x, target.y);
            const arrow = this.createArrow(target.x, target.y - 60, target.id);
            this.arrows.push({
                container: arrow,
                targetX: target.x,
                targetY: target.y - 60,
                targetId: target.id,
                targetObject: target
            });
        });
    }

    createArrow(x, y, id) {
        console.log('Arrow creation started at:', x, y);

        const arrowGroup = this.add.container(x, y);
        arrowGroup.setDepth(DEPTH_LAYERS.TUTORIAL_OVERLAY - 1);

        // Create arrow shaft (vertical line)
        const shaft = this.make.graphics({
            x: 0,
            y: 0,
            add: false
        });
        shaft.lineStyle(6, 0xff0000);
        shaft.beginPath();
        shaft.moveTo(0, -25);
        shaft.lineTo(0, 15);
        shaft.strokePath();
        arrowGroup.add(shaft);

        // Create arrow head (triangle pointing down)
        const head = this.make.graphics({
            x: 0,
            y: 0,
            add: false
        });
        head.fillStyle(0xff0000);
        head.beginPath();
        head.moveTo(0, 25);
        head.lineTo(-12, 10);
        head.lineTo(12, 10);
        head.closePath();
        head.fillPath();
        arrowGroup.add(head);

        // Floating animation (up and down)
        this.tweens.add({
            targets: arrowGroup,
            y: {
                value: y + 12,
                duration: 1200,
                ease: 'Sine.inout',
                yoyo: true,
                repeat: -1
            }
        });

        console.log('Arrow created:', arrowGroup);
        return arrowGroup;
    }

    onToolSelected(button) {
        const toolName = this.getToolNameFromButton(button);

        switch (this.currentStep) {
            case TUTORIAL_STEPS.HAND_TOOL:
                if (toolName === 'hand') {
                    this.showChickenMovementStep();
                }
                break;

            case TUTORIAL_STEPS.STICK_TOOL:
                if (toolName === 'stick') {
                    this.showEnemyDamageStep();
                }
                break;

            case TUTORIAL_STEPS.FEED_CHICKEN:
                if (toolName === 'hand') {
                    // Tool switched, ready to feed
                }
                break;
        }
    }

    getToolNameFromButton(button) {
        if (button === this.toolManager.hand) return 'hand';
        if (button === this.toolManager.stick) return 'stick';
        if (button === this.toolManager.bulletegg) return 'bulletegg';
        if (button === this.toolManager.minegg) return 'minegg';
        if (button === this.toolManager.empEggranade) return 'empeggranade';
        return null;
    }

    onEnemyDefeated() {
        if (this.currentStep === TUTORIAL_STEPS.ENEMY_DAMAGE) {
            this.showEnemyDefeatStep();
        }
    }

    onChickenMoved() {
        if (this.currentStep !== TUTORIAL_STEPS.CHICKEN_MOVEMENT) return;

        this.clearTutorialOverlay();
        this.showMovementSuccessStep();
    }

    onChickenMovementStopped() {
        if (this.currentStep !== TUTORIAL_STEPS.MOVEMENT_STOP) return;

        this.clearTutorialOverlay();
        this.showMovementStopSuccessStep();
    }

    clearTutorialOverlay() {
        this.uiScene.clearDialog();
    }

    catchFood(person, food) {
        this.eggSwallowSound.play();
        const personParent = person.getData('parent');

        if (personParent instanceof Chicken) {
            personParent.feed();

            if (this.currentStep === TUTORIAL_STEPS.FEED_CHICKEN) {
                this.onChickenFed();
            }
        }
        food.destroy();
    }

    update() {
        // Keep chicken on screen
        const chicken = this.chickenGroup.getChildren()[0];
        if (chicken) {
            const screenWidth = this.cameras.main.width;
            const screenHeight = this.cameras.main.height - 85;
            const chickenSize = 40;

            if (chicken.x < chickenSize) {
                chicken.x = screenWidth / 2;
                chicken.y = screenHeight / 2;
            } else if (chicken.x > screenWidth - chickenSize) {
                chicken.x = screenWidth / 2;
                chicken.y = screenHeight / 2;
            } else if (chicken.y < chickenSize) {
                chicken.x = screenWidth / 2;
                chicken.y = screenHeight / 2;
            } else if (chicken.y > screenHeight - chickenSize) {
                chicken.x = screenWidth / 2;
                chicken.y = screenHeight / 2;
            }
        }

        // Respawn enemy if it leaves the screen during enemy damage step
        if (this.currentStep === TUTORIAL_STEPS.ENEMY_DAMAGE && this.demoEnemy) {
            const screenWidth = this.cameras.main.width;
            const screenHeight = this.cameras.main.height - 85;
            const enemySize = 40;

            if (
                this.demoEnemy.x < -enemySize ||
                this.demoEnemy.x > screenWidth + enemySize ||
                this.demoEnemy.y < -enemySize ||
                this.demoEnemy.y > screenHeight + enemySize
            ) {
                // Destroy old enemy
                if (this.demoEnemy && this.demoEnemy.active) {
                    this.demoEnemy.destroy();
                }

                // Spawn new enemy at a safe location
                this.demoEnemy = new Snake(this, 700, 500);
                this.demoEnemy.setDepth(DEPTH_LAYERS.ENEMIES);

                // Update arrow target
                this.arrowTargets = [{
                    x: this.demoEnemy.x,
                    y: this.demoEnemy.y,
                    id: 'enemy'
                }];
                this.createArrows();

                console.log('Enemy respawned at:', this.demoEnemy.x, this.demoEnemy.y);
            }
        }

        // Update arrows to follow targets
        this.arrows.forEach((arrow, index) => {
            // Get the current target position based on targetId
            let targetX = arrow.targetX;
            let targetY = arrow.targetY;

            if (arrow.targetId === 'chicken') {
                const chicken = this.chickenGroup.getChildren()[0];
                if (chicken) {
                    targetX = chicken.x;
                    targetY = chicken.y - 250;
                }
            } else if (arrow.targetId === 'food') {
                const food = this.foodGroup.getChildren()[0];
                if (food) {
                    targetX = food.x;
                    targetY = food.y - 60;
                }
            } else if (arrow.targetId === 'egg') {
                const eggs = this.eggGroup.getChildren();
                if (eggs.length > 0) {
                    targetX = eggs[eggs.length - 1].x;
                    targetY = eggs[eggs.length - 1].y - 60;
                }
            } else if (arrow.targetId === 'hatching-egg') {
                if (this.demoHatchingEgg) {
                    targetX = this.demoHatchingEgg.x;
                    targetY = this.demoHatchingEgg.y - 60;
                }
            } else if (arrow.targetId === 'newborn') {
                const newChicken = this.chickenGroup.getChildren()[this.chickenGroup.getLength() - 1];
                if (newChicken) {
                    targetX = newChicken.x;
                    targetY = newChicken.y - 60;
                }
            } else if (arrow.targetId === 'enemy') {
                if (this.demoEnemy) {
                    targetX = this.demoEnemy.x;
                    targetY = this.demoEnemy.y - 60;
                }
            }

            // Smoothly follow the target
            const currentX = arrow.container.x;
            const currentY = arrow.container.y;
            const lerpFactor = 0.12;

            arrow.container.x = Phaser.Math.Linear(currentX, targetX, lerpFactor);
            arrow.container.y = Phaser.Math.Linear(currentY, targetY, lerpFactor);

            // Update stored target positions for next frame
            arrow.targetX = targetX;
            arrow.targetY = targetY;
        });
    }
}
