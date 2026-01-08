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

        this.add.image(400, 300, 'titlepage');
        this.fullScreen = this.add.image(750, 50, 'fullScreen')
            .setInteractive({
                useHandCursor: true
            })
            .on('pointerdown', function () {
            this.scale.toggleFullscreen();
        }, this);

        this.playButton = this.add.image(220, 160, 'playButton')
            .setInteractive({
                useHandCursor: true
            })
            .on('pointerover', () => {
                this.playButton.setFrame('over');
            })
            .on('pointerout', () => {
                this.playButton.setFrame('out');
            })
            .on('pointerdown', () => {
                this.playButton.setFrame('down');
            })
            .on('pointerup', () => {
                this.changeScene();
            });

        var style = {
            font: "25px Arial Black",
            fill: "#ffffff",
            align: "left",
            strokeThickness: 2,
            stroke: 'black'
        };

        // this.add.text(10, 380, 'Intructions: You have the duty to protect a Birzard until it \ngrows and can live for its own. Be careful though, if you \noverprotect him, it will suffer when the most dangerous \nenemies comes. \n\nOh, you want to know how to atack the enemies? \nJust click on them of course =-D', style);
        this.add.text(10, 350, 'You will start your chicken farm on a dangerous land \n(don\'t ask me why...). \nYour chicken\'s eggs will hatch and give life to newborns, \nbut too many of them is hard to control, because they \ncan scape or be eaten by monsters, or even... wait, \nI dont wanna give spoilers.\nTo create your chickens in peace, you have to find the \nsource of this evilness.', style);

        style = {
            font: "20px Arial Black",
            fill: "#ffffff",
            align: "left",
            strokeThickness: 2,
            stroke: 'black'
        };
        this.add.text(415, 100, 'Tip: use the hand to scare your \nchickens thus avoid the danger, \nother usables are for doing \ndamage. \nClick on eggs to collect them, \nthey can be exchanged for \npowerfull weapons.', style);

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
