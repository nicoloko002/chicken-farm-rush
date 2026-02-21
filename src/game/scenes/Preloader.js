import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.add.image(512, 384, 'bgLoader');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        
        // Menu
        this.load.image('titlepage', 'images/backgrounds/ceu.png');
        this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
        this.load.audio('titleMusic', ['musics/Town_-_Quiet_Country_Village.mp3']);
        this.load.audio('gameMusic', ['musics/JDB Artist - Inspirational Vol.2 - 02 My Way (Adventure).mp3']);
        this.load.audio('endGameMusic', ['musics/JDB Artist - Inspirational Vol.2 - 04 We Stand Together (Adventure).mp3']);
        this.load.image('invisible_block', 'invisible_block.png');
        this.load.image('background', 'images/backgrounds/home.png');
        this.load.image('bg1', 'images/backgrounds/bg1.jpeg');
        this.load.image('bg2', 'images/backgrounds/bg2.jpeg');
        this.load.image('bg3', 'images/backgrounds/bg3.jpeg');
        this.load.image('bg4', 'images/backgrounds/bg4.jpeg');
        this.load.image('bg5', 'images/backgrounds/bg5.jpeg');
        this.load.image('bg6', 'images/backgrounds/bg6.jpeg');
        this.load.image('bg7', 'images/backgrounds/bg7.jpeg');
        this.load.image('panel', 'images/ui/panel.png');
        this.load.image('menuButtom', 'images/ui/buttons/menuButtom.png');

        // UI
        this.load.image('chargeBarBackground', 'images/ui/chargeBar/chargebarBackground.png');
        this.load.image('fullScreen', 'images/ui/full_screen.png');
        this.load.image('chargeBarIconBackground', 'images/ui/chargeBar/chargebaIconBackground.png');
        this.load.image('chargeBarPowerFill', 'images/ui/chargeBar/chargebarFoodFill.png');
        this.load.image('chargeBarHealthFill', 'images/ui/chargeBar/chargebarHealthFill.png');
        this.load.image('chargeBarXpFill', 'images/ui/chargeBar/chargebaXpFill.png');
        this.load.image('chargeBarPowerIcon', 'images/ui/chargeBar/chargeBarIconPower.png');
        this.load.image('chargeBarHealthIcon', 'images/ui/chargeBar/chargeBarIconHealth.png');
        this.load.image('chargeBarXpIcon', 'images/ui/chargeBar/chargeBarIconXp.png');

        this.load.image('bulletegg', 'images/ui/bulletegg.png');
        this.load.spritesheet('bgBtn', 'images/ui/bgBtn.png', { frameWidth: 300/2, frameHeight: 151 });
        this.load.spritesheet('minegg', 'images/ui/minegg.png', { frameWidth: 300/3, frameHeight: 55 });
        this.load.image('stick', 'images/ui/stick.png');
        this.load.image('food', 'images/itens/food.png');
        this.load.image('empEggranade', 'images/ui/empEggranade.png');

        // Pets
        this.load.image('miniChicken', 'images/player/pets/chicken.png');
        this.load.image('evolve', 'images/player/pets/evolve.png');
        this.load.image('petEgg', 'images/player/pets/egg.png');
        this.load.spritesheet('crackingEgg', 'images/player/pets/cracking_egg.png', { frameWidth: 100, frameHeight: 137 });

        this.load.atlas('bite', 'images/atacks/bite.png', 'images/atacks/bite.json');
        this.load.atlas('masterHand', 'images/atacks/master_hand.png', 'images/atacks/master_hand.json');
        this.load.spritesheet('punchEffect', 'images/atacks/punchEffect.png', { frameWidth: 400/4, frameHeight: 170/2 });
        this.load.spritesheet('shotEffect', 'images/atacks/shotEffect.png', { frameWidth: 400/4, frameHeight: 170/2 });
        this.load.spritesheet('bombEffect', 'images/atacks/bombEffect.png', { frameWidth: 400/4, frameHeight: 170/2 });
        this.load.spritesheet('empEffect', 'images/atacks/empEffect.png', { frameWidth: 400/4, frameHeight: 170/2 });

        this.load.audio('crackingEgg', ['sound/cracking_egg.ogg']);
        this.load.audio('bite', ['sound/bite.ogg']);

        this.load.spritesheet('snake', 'images/enemies/EarthWormMoving.png', { frameWidth: 796/4, frameHeight: 426/3 });
        // this.load.spritesheet('chicken', 'images/enemies/$Animal_HF1_Chicken.png', { frameWidth: 50, frameHeight: 30 });
        this.load.spritesheet('alien', 'images/enemies/alien.png', { frameWidth: 551/5, frameHeight: 100 });
        this.load.spritesheet('shark', 'images/enemies/shark.png', { frameWidth: 880/4, frameHeight: 441/3 });
        this.load.image('frog', 'images/enemies/frog.png');

        // Bosses
        this.load.spritesheet('wormBossIddle', 'images/enemies/wormBoss/iddle.png', { frameWidth: 3840/8, frameHeight: 4800/8 });
        this.load.spritesheet('wormBossScream', 'images/enemies/wormBoss/scream.png', { frameWidth: 3840/8, frameHeight: 2400/4 });
        this.load.spritesheet('wormBossScreamToIddle', 'images/enemies/wormBoss/screamToIddle.png', { frameWidth: 3840/8, frameHeight: 3000/5 });
        this.load.spritesheet('wormBossSpawn', 'images/enemies/wormBoss/spawn.png', { frameWidth: 3840/8, frameHeight: 2400/4 });


        this.load.audio('snakeSound', ['sound/snake.ogg']);
        this.load.audio('damageSound', ['sound/damage.ogg']);
        this.load.audio('boom', ['sound/boom.mp3']);
        this.load.audio('shock', ['sound/shock.mp3']);
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
        // this.scene.start('Game');
    }
}
