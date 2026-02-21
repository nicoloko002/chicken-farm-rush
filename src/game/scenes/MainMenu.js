import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.music = this.sound.add('titleMusic');
        this.music.play();

        const titlePage = this.add.image(0, 0, 'titlepage');
        titlePage.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        titlePage.setOrigin(0, 0);

        this.fullScreen = this.add.image(this.cameras.main.width - 50, 50, 'fullScreen')
            .setInteractive({
                useHandCursor: true
            })
            .on('pointerdown', () => this.scale.toggleFullscreen());

        const playButton = this.add.image(220, 160, 'menuButtom');
        playButton.setDisplaySize(300, 160);
        playButton.setInteractive({
            useHandCursor: true
        }).on('pointerup', () => {
            this.changeScene();
        });
        this.add.text(160, 112, 'Play', { font: '64px CabinSketch', fill: '#393939', fontFamily: 'CabinSketch' });

        const tutorialButton = this.add.image(220, 320, 'menuButtom');
        tutorialButton.setDisplaySize(300, 160);
        tutorialButton.setInteractive({
            useHandCursor: true
        }).on('pointerup', () => {
            this.changeScene();
        });
        this.add.text(140, 285, 'Tutorial', { font: '50px CabinSketch', fill: '#393939', fontFamily: 'CabinSketch' });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }
        this.music.stop();
        this.scene.start('Game');
    }
}
